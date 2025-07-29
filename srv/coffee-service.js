const cds = require('@sap/cds')

module.exports = class CoffeeService extends cds.ApplicationService {
  async init() {
    // 1️⃣ Hook into "before" all READ/WRITE events on the service
    //    This will run before ANY request (READ, CREATE, ACTION) on CoffeeService
    this.before('*', async (req) => {

      // ✅ Check if user is authenticated
      if (!req.user || !req.user.attr || !req.user.attr.email) {
        console.log('⚠️ No email found on user (user might not be authenticated)');
        return; // We don't stop execution, just don't auto-create a user
      }

      const email = req.user.attr.email;

      // ✅ Access the Users table from our CDS model
      const { Users } = this.entities;

      // ✅ Look for an existing user by email
      const existingUser = await SELECT.one.from(Users).where({ email });

      // ✅ If user doesn't exist yet, create them
      if (!existingUser) {
        console.log(`ℹ️ First login detected. Creating new user for email: ${email}`);

        await INSERT.into(Users).entries({
          userId: cds.utils.uuid(),   // generate UUID for internal use
          email: email,               // store SAP email for identification
          balance: 0,                 // default balance
          role: 'User'                // default role (could also handle Admin separately)
        });
      } else {
        console.log(`✅ User already exists: ${email}`);
      }
    });

    // 2️⃣ Import all your action/handler files (unchanged)
    const tapHandler = require('./handlers/tap');
    const batchPayHandler = require('./handlers/batchPay');
    const forecastHandler = require('./handlers/forecast');
    const lowBalanceHandler = require('./handlers/lowBalance');
    const topUpHandler = require('./handlers/topUp');

    // 3️⃣ Register handlers for actions (unchanged)
    tapHandler(this);
    batchPayHandler(this);
    forecastHandler(this);
    lowBalanceHandler(this);
    topUpHandler(this);

    // 4️⃣ Handler for getCurrentUser function
    this.on('getCurrentUser', async (req) => {
      if (!req.user || !req.user.attr) {
        req.reject(401, 'Not authenticated');
      }

      const email = req.user.attr.email || req.user.id;
      const { Users } = this.entities;
      
      // Get user from database
      const dbUser = await SELECT.one.from(Users).where({ email });
      
      if (!dbUser) {
        // This shouldn't happen because of the before handler, but just in case
        req.reject(404, 'User not found in database');
      }
      
      // Return user info in the format the frontend expects
      return {
        userId: dbUser.userId,
        email: dbUser.email,
        firstName: req.user.attr.givenName || '',
        lastName: req.user.attr.familyName || '',
        displayName: req.user.attr.name || dbUser.email
      };
    });

    // 4️⃣ Continue with default initialization
    return super.init();
  }
};
