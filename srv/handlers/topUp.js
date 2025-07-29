const cds = require('@sap/cds')
const paypal = require('../integrations/paypal')

module.exports = srv => {
  srv.on('TopUp', async ({ data, user, req }) => {
    //Added for debugging purpose
    console.log("🔑 Logged in user:", req.user);
    
    const { amount } = data
    const txId = cds.utils.uuid()

    try {
      const orderId = await paypal.createOrder(amount, txId)

      await cds.tx(req).run(
        INSERT.into('coffeex.TopUpTransaction').entries({
          txId,
          userId: user.id,
          amount: amount.value,
          status: 'PENDING',
          paypalOrderId: orderId,
          createdAt: new Date()
        })
      )

      return `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`
    } catch (err) {
      console.error('Failed to create PayPal order:', err)
      cds.error('Top-up failed: PayPal order could not be created')
    }
  })
}
