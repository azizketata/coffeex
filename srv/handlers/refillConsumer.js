const cds = require('@sap/cds')
const scalewaySQS = require('../integrations/scaleway-sqs')

module.exports = async () => {
  try {
    // For production, use Scaleway SQS
    if (process.env.NODE_ENV === 'production' || process.env.USE_SCALEWAY_SQS === 'true') {
      console.log('Initializing Scaleway SQS consumer for RefillEvents')
      
      // Subscribe to RefillEvent messages
      scalewaySQS.on('RefillEvent', async msg => {
        console.log('Received RefillEvent:', msg.data)
        
        const { machineId, qtyGram } = msg.data
        
        if (!machineId || !qtyGram) {
          console.error('Invalid RefillEvent data:', msg.data)
          return
        }
        
        try {
          const db = await cds.connect.to('db')
          
          // Update machine bean level
          await UPDATE('coffeex.Machine')
            .set({ beanLevel: qtyGram })
            .where({ machineId })
          
          // Create refill event record
          await INSERT.into('coffeex.RefillEvent').entries({
            eventId: cds.utils.uuid(),
            machineId,
            qtyGram
          })
          
          console.log(`Machine ${machineId} refilled with ${qtyGram} grams`)
          
          // Optionally trigger forecast recalculation
          // This could be done asynchronously
          cds.spawn(async () => {
            try {
              const srv = await cds.connect.to('CoffeeService')
              await srv.send('Forecast')
            } catch (err) {
              console.error('Failed to trigger forecast update:', err)
            }
          })
          
        } catch (error) {
          console.error('Failed to process RefillEvent:', error)
        }
      })
      
      console.log('Scaleway SQS RefillEvent consumer initialized')
      
    } else {
      // For local development, check if messaging service is configured
      if (!cds.env.requires?.messaging) {
        console.log('Messaging service not configured, skipping refill consumer initialization')
        return
      }
      
      // Connect to local file-based messaging
      const messaging = await cds.connect.to('messaging')
      
      // Subscribe to RefillEvent messages
      messaging.on('RefillEvent', async msg => {
        console.log('Received RefillEvent:', msg.data)
        
        const { machineId, qtyGram } = msg.data
        
        if (!machineId || !qtyGram) {
          console.error('Invalid RefillEvent data:', msg.data)
          return
        }
        
        try {
          const db = await cds.connect.to('db')
          
          // Update machine bean level
          await UPDATE('coffeex.Machine')
            .set({ beanLevel: qtyGram })
            .where({ machineId })
          
          // Create refill event record
          await INSERT.into('coffeex.RefillEvent').entries({
            eventId: cds.utils.uuid(),
            machineId,
            qtyGram
          })
          
          console.log(`Machine ${machineId} refilled with ${qtyGram} grams`)
          
          // Optionally trigger forecast recalculation
          // This could be done asynchronously
          cds.spawn(async () => {
            try {
              const srv = await cds.connect.to('CoffeeService')
              await srv.send('Forecast')
            } catch (err) {
              console.error('Failed to trigger forecast update:', err)
            }
          })
          
        } catch (error) {
          console.error('Failed to process RefillEvent:', error)
        }
      })
      
      console.log('Local RefillEvent consumer initialized')
    }
    
  } catch (error) {
    console.error('Failed to initialize refill consumer:', error)
  }
} 