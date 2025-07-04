const cds = require('@sap/cds')

// Standard CAP server that auto-loads handlers
module.exports = cds.server

// Initialize components on server start
cds.on('served', async () => {
  console.log('CoffeeX backend service started')
  
  // Initialize the refill consumer
  try {
    const refillConsumer = require('./handlers/refillConsumer')
    await refillConsumer()
    console.log('RefillEvent consumer initialized')
  } catch (error) {
    console.error('Failed to initialize refill consumer:', error)
  }
  
  // Initialize job scheduler
  try {
    require('../jobs/runner')
    console.log('Job scheduler initialized')
  } catch (error) {
    console.error('Failed to initialize job scheduler:', error)
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
}) 