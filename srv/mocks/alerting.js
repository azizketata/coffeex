module.exports = class AlertingService {
  async init() {
    // Mock alerting service for local development
    this.on('*', async (req) => {
      console.log(`[MOCK ALERT] Event: ${req.event}`, req.data)
      // Just log alerts in development
      return { success: true }
    })
  }
  
  emit(event, data) {
    console.log(`[MOCK ALERT] Emitting ${event}:`, data)
    return Promise.resolve()
  }
} 