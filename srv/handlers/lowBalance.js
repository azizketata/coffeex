const cds = require('@sap/cds')

module.exports = srv => {
  srv.on('CheckLowBalances', async req => {
    const db = await cds.tx(req)
    
    try {
      // Get users with low balance from the view
      const lowBalanceUsers = await SELECT.from('coffeex.views.LowBalanceUsers')
      
      console.log(`Found ${lowBalanceUsers.length} users with low balance`)
      
      // Send notifications
      if (lowBalanceUsers.length > 0) {
        try {
          const alerts = await cds.connect.to('alerting')
          
          for (const user of lowBalanceUsers) {
            await alerts.emit('LOW_BALANCE_REMINDER', {
              userId: user.userId,
              balance: user.balance,
              message: `Your coffee balance is low (€${user.balance}). Please top up to continue enjoying coffee!`
            })
            
            console.log(`Sent low balance reminder to user ${user.userId} (balance: €${user.balance})`)
          }
        } catch (err) {
          console.error('Alert notification failed:', err)
        }
      }
      
      return lowBalanceUsers.length
      
    } catch (error) {
      console.error('Low balance check failed:', error)
      throw error
    }
  })
} 