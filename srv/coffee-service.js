const cds = require('@sap/cds')

module.exports = class CoffeeService extends cds.ApplicationService {
  async init() {
    // Import all handlers
    const tapHandler = require('./handlers/tap')
    const batchPayHandler = require('./handlers/batchPay')
    const forecastHandler = require('./handlers/forecast')
    const lowBalanceHandler = require('./handlers/lowBalance')
    const topUpHandler = require('./handlers/topUp')
    
    // Register handlers
    tapHandler(this)
    batchPayHandler(this)
    forecastHandler(this)
    lowBalanceHandler(this)
    topUpHandler(this)
    
    // Continue with default initialization
    return super.init()
  }
} 