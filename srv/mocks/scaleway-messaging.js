const cds = require('@sap/cds')
const scalewaySQS = require('../integrations/scaleway-sqs')

module.exports = class ScalewayMessagingService extends cds.Service {
  async init() {
    console.log('[Scaleway Messaging] Initializing messaging service')
    
    // Forward all emit calls to Scaleway SQS
    this.on('*', async (req) => {
      try {
        // For emit operations
        if (req.event && req.data) {
          await scalewaySQS.emit(req.event, req.data)
          console.log(`[Scaleway Messaging] Emitted ${req.event} event`)
          return { success: true }
        }
      } catch (error) {
        console.error(`[Scaleway Messaging] Failed to emit ${req.event}:`, error)
        throw error
      }
    })
    
    // Allow subscribing to events through this service
    this.on = (event, handler) => {
      scalewaySQS.on(event, handler)
    }
    
    // Provide emit method that uses Scaleway SQS
    this.emit = async (event, data) => {
      return scalewaySQS.emit(event, data)
    }
    
    return super.init()
  }
} 