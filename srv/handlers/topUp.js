const cds = require('@sap/cds');
const paypal = require('../integrations/paypal');

module.exports = srv => {
    srv.on('TopUp', async ({ data, user, req }) => {
        console.log("🔑 TopUp initiated by user:", req.user?.id || '(no user id)');
        console.log("📦 Request data received:", data);

        const { amount } = data;
        const db = await cds.tx(req);
        const txId = cds.utils.uuid();
        
        // Get service entities
        const { Users, TopUpTransactions } = srv.entities;

        try {
            // 🧠 Step 1: Validate user exists in DB
            console.log("🔎 Checking if user exists in DB...");
            const [dbUser] = await db.read(Users).where({ userId: user.id });

            if (!dbUser) {
                console.warn(`❌ Unknown user with ID: ${user.id}`);
                return req.error(404, 'Unknown user');
            }
            console.log(`✅ Found user in DB: ${dbUser.email || user.id}`);

            // 🧠 Step 2: Create PayPal order
            console.log(`🧾 Creating PayPal order for amount: ${amount}, txId: ${txId}`);
            const orderId = await paypal.createOrder(amount, txId);
            console.log(`✅ PayPal order created. Order ID: ${orderId}`);

            // 🧠 Step 3: Insert top-up transaction
            const topUpEntry = {
                txId,
                userId: user.id,
                amount,
                status: 'PENDING',
                paypalOrderId: orderId,
                createdAt: new Date()
            };

            console.log("📥 Inserting into TopUpTransaction:", topUpEntry);
            await db.run(INSERT.into(TopUpTransactions).entries(topUpEntry));
            console.log('✅ TopUpTransaction inserted successfully');

            // 🧠 Step 4: Return PayPal redirect link
            const redirectUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`;
            console.log("🔗 Returning PayPal redirect link:", redirectUrl);

            return redirectUrl;

        } catch (err) {
            console.error('❌ Failed to process TopUp:', err.message);
            console.error(err.stack);
            return req.error(500, 'Top-up failed: Could not create PayPal order or persist transaction.');
        }
    });
};