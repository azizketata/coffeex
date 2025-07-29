const cds = require('@sap/cds')

module.exports = class CoffeeService extends cds.ApplicationService {
  async init() {
    this.on('READ', 'Users', async (req, next) => {
      if (!req.user || !req.user.attr || !req.user.attr.email) {
        return next();
      }

      const email = req.user.attr.email;
      const { Users } = this.entities;
      let user = await SELECT.one.from(Users).where({ email });

      if (!user) {
        user = await INSERT.into(Users).entries({
          userId: cds.utils.uuid(),
          email: email,
          balance: 0,
          role: 'User'
        });
      }
      
      // Return the user, which will be handled by the default handler
      return user;
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
