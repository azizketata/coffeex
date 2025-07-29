const cds = require('@sap/cds')

module.exports = class CoffeeService extends cds.ApplicationService {
  async init() {
    console.log('[CoffeeService] Initializing...');
    
    // 1️⃣ Hook into "before" all READ/WRITE events on the service
    //    This will run before ANY request (READ, CREATE, ACTION) on CoffeeService
    this.before('*', async (req) => {
      console.log(`[CoffeeService.before] Event: ${req.event}, Target: ${req.target?.name || 'unknown'}`);
      console.log(`[CoffeeService.before] Request URL: ${req._.req?.url}`);
      console.log(`[CoffeeService.before] User object:`, JSON.stringify(req.user, null, 2));

      // ✅ Check if user is authenticated
      if (!req.user || !req.user.attr || !req.user.attr.email) {
        console.log('⚠️ No email found on user (user might not be authenticated)');
        console.log('User object structure:', {
          hasUser: !!req.user,
          hasAttr: !!req.user?.attr,
          hasEmail: !!req.user?.attr?.email,
          userId: req.user?.id,
          userAttrs: req.user?.attr
        });
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
      console.log(`[CoffeeService.getCurrentUser] Event: ${req.event}, Target: ${req.target?.name || 'unknown'}`);
      console.log(`[CoffeeService.getCurrentUser] Request URL: ${req._.req?.url}`);
      console.log(`[CoffeeService.getCurrentUser] User object:`, JSON.stringify(req.user, null, 2));

      if (!req.user || !req.user.attr) {
        console.error('[CoffeeService.getCurrentUser] Authentication failed - no user or attributes');
        req.reject(401, 'Not authenticated');
      }

      const email = req.user.attr.email || req.user.id;
      console.log(`[CoffeeService.getCurrentUser] Email extracted: ${email}`);
      
      const { Users } = this.entities;
      
      try {
        // Get user from database
        const dbUser = await SELECT.one.from(Users).where({ email });
        console.log(`[CoffeeService.getCurrentUser] Database user found:`, dbUser);
        
        if (!dbUser) {
          // This shouldn't happen because of the before handler, but just in case
          console.error(`[CoffeeService.getCurrentUser] User not found in database for email: ${email}`);
          req.reject(404, 'User not found in database');
        }
        
        // Return user info in the format the frontend expects
        const response = {
          userId: dbUser.userId,
          email: dbUser.email,
          firstName: req.user.attr.givenName || '',
          lastName: req.user.attr.familyName || '',
          displayName: req.user.attr.name || dbUser.email
        };
        
        console.log('[CoffeeService.getCurrentUser] Returning user data:', response);
        return response;
      } catch (error) {
        console.error('[CoffeeService.getCurrentUser] Error fetching user:', error);
        req.reject(500, `Internal server error: ${error.message}`);
      }
    });

    // 4️⃣ Continue with default initialization
    return super.init();
  }
};
