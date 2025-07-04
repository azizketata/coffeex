const cds = require('@sap/cds')

module.exports = srv => {
  srv.on('BatchPay', async req => {
    const db = await cds.tx(req)
    
    // Get all open transactions
    const openTx = await SELECT.from('coffeex.CoffeeTx').where`paymentStatus = 'OPEN'`
    
    let success = 0
    
    // Process each transaction
    for (const tx of openTx) {
      try {
        const paypalResult = await require('../integrations/paypal').capture(tx)
        
        if (paypalResult) {
          // Update transaction status
          await UPDATE('coffeex.CoffeeTx')
            .set({ paymentStatus: 'CAPTURED' })
            .where({ txId: tx.txId })
          
          // Deduct from user balance
          await UPDATE('coffeex.User')
            .set`balance = balance - ${tx.price}`
            .where({ userId: tx.userId })
          
          success++
        } else {
          // Mark as failed if PayPal capture fails
          await UPDATE('coffeex.CoffeeTx')
            .set({ paymentStatus: 'FAILED' })
            .where({ txId: tx.txId })
        }
      } catch (error) {
        console.error(`Failed to process transaction ${tx.txId}:`, error)
        
        // Mark as failed on error
        await UPDATE('coffeex.CoffeeTx')
          .set({ paymentStatus: 'FAILED' })
          .where({ txId: tx.txId })
      }
    }
    
    return success
  })
} 