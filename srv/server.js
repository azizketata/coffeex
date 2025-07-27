const cds = require('@sap/cds')
const paypal = require('./integrations/paypal')


// Standard CAP server that auto-loads handlers
module.exports = cds.server

console.log('[server.js] loaded')

// Initialize components on server start
cds.on('served', async () => {
  console.log('CoffeeX backend service started')
  
  // Initialize the refill consumer
  try {
    const refillConsumer = require('./handlers/refillConsumer')
    await refillConsumer()
  } catch (error) {
    console.error('Failed to initialize refill consumer:', error.message)
  }
  
  // Initialize job scheduler
  try {
    require('../jobs/runner')
    console.log('Job scheduler initialized')
  } catch (error) {
    console.error('Failed to initialize job scheduler:', error)
  }

  //Initialize top up 
  try {
  require('./handlers/topUp')(cds)
  console.log('TopUp handler registered')
} catch (e) {
  console.error('Failed to register TopUp handler:', e)
}
})

// Add health endpoint
cds.on('bootstrap', (app) => {
  // Health check endpoint
  app.get('/health', async (req, res) => {
    try {
      const db = await cds.connect.to('db')
      const testQuery = SELECT.one.from('coffeex.User').columns('count(*) as count')
      await db.run(testQuery)
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'coffeex-backend',
        version: '1.0.0'
      })
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      })
    }
  })
  
  // Liveness probe
  app.get('/health/live', (req, res) => {
    res.json({ status: 'alive' })
  })
  
  // Readiness probe  
  app.get('/health/ready', (req, res) => {
    if (cds.services['CoffeeService']) {
      res.json({ status: 'ready' })
    } else {
      res.status(503).json({ status: 'not ready' })
    }
  })

  app.get('/paypal/success', async (req, res) => {
  const { token: orderId, txId } = req.query
    try {
    const success = await paypal.captureOrder(orderId)
    if (success) {
      const tx = await cds.run(SELECT.one.from('coffeex.TopUpTransaction').where({ txId }))
      await cds.run([
        UPDATE('coffeex.TopUpTransaction').set({ status: 'COMPLETED' }).where({ txId }),
        UPDATE('coffeex.User').set`balance = balance + ${tx.amount}`.where({ userId: tx.userId })
      ])
      return res.redirect('https://localhost:3003/topup/success') //need to change ports later
    } else {
      await cds.run(UPDATE('coffeex.TopUpTransaction').set({ status: 'FAILED' }).where({ txId }))
      return res.redirect('https://localhost:3003/topup/fail') //need to change port later
    }
  }
  catch(e) {
    console.error('Capture failed:', e)
    return res.status(500).send('Error capturing PayPal payment')
  } 
})

}) 