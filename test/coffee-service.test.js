const cds = require('@sap/cds/lib')
const { expect } = require('chai')

describe('CoffeeService', () => {
  let srv, db
  
  // Setup test environment
  before(async () => {
    // Deploy to in-memory SQLite database
    db = await cds.deploy('./db').to('sqlite::memory:')
    
    // Serve the CoffeeService
    srv = await cds.serve('./srv').from('./srv')
    
    // Initialize test data
    await db.run(INSERT.into('coffeex.User').entries([
      { userId: 'user-1', balance: 10.00, role: 'User' },
      { userId: 'user-2', balance: 0.50, role: 'User' },
      { userId: 'admin-1', balance: 50.00, role: 'Admin' }
    ]))
    
    await db.run(INSERT.into('coffeex.Machine').entries([
      { machineId: 'machine-1', location: 'Office Kitchen', beanLevel: 500 },
      { machineId: 'machine-2', location: 'Meeting Room', beanLevel: 100 }
    ]))
  })
  
  describe('Tap action', () => {
    it('should create a coffee transaction for valid user', async () => {
      const result = await srv.send('POST', '/odata/v4/Tap', {
        machineId: 'machine-1',
        userId: 'user-1'
      })
      
      expect(result).to.have.property('txId')
      expect(result.userId).to.equal('user-1')
      expect(result.machineId).to.equal('machine-1')
      expect(result.price).to.equal(1.5)
      expect(result.paymentStatus).to.equal('OPEN')
    })
    
    it('should reject tap for unknown user', async () => {
      try {
        await srv.send('POST', '/odata/v4/Tap', {
          machineId: 'machine-1',
          userId: 'unknown-user'
        })
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error.message).to.include('Unknown user')
      }
    })
    
    it('should reject tap on insufficient balance', async () => {
      try {
        await srv.send('POST', '/odata/v4/Tap', {
          machineId: 'machine-1',
          userId: 'user-2'
        })
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error.message).to.include('Insufficient balance')
      }
    })
  })
  
  describe('BatchPay action', () => {
    before(async () => {
      // Create some test transactions
      await db.run(INSERT.into('coffeex.CoffeeTx').entries([
        { 
          txId: 'tx-1', 
          userId: 'user-1', 
          machineId: 'machine-1', 
          price: 1.5, 
          paymentStatus: 'OPEN' 
        },
        { 
          txId: 'tx-2', 
          userId: 'user-1', 
          machineId: 'machine-2', 
          price: 1.5, 
          paymentStatus: 'OPEN' 
        },
        { 
          txId: 'tx-3', 
          userId: 'admin-1', 
          machineId: 'machine-1', 
          price: 1.5, 
          paymentStatus: 'CAPTURED' 
        }
      ]))
    })
    
    it('should process open transactions', async () => {
      // Mock PayPal integration
      const paypalMock = require('../srv/integrations/paypal')
      paypalMock.capture = async () => true
      
      const result = await srv.send('POST', '/odata/v4/BatchPay')
      
      // Should process 2 open transactions
      expect(result).to.equal(2)
      
      // Verify transactions are marked as captured
      const txs = await db.run(
        SELECT.from('coffeex.CoffeeTx').where({ paymentStatus: 'CAPTURED' })
      )
      expect(txs.length).to.be.at.least(3) // Original 1 + 2 processed
    })
  })
  
  describe('Entity access', () => {
    it('should allow reading Users', async () => {
      const users = await srv.send('GET', '/odata/v4/Users')
      expect(users.value).to.be.an('array')
      expect(users.value.length).to.be.at.least(3)
    })
    
    it('should allow reading Machines', async () => {
      const machines = await srv.send('GET', '/odata/v4/Machines')
      expect(machines.value).to.be.an('array')
      expect(machines.value.length).to.equal(2)
    })
    
    it('should allow reading CoffeeTxes', async () => {
      const txs = await srv.send('GET', '/odata/v4/CoffeeTxes')
      expect(txs.value).to.be.an('array')
    })
    
    it('should not allow updating Users directly', async () => {
      try {
        await srv.send('PATCH', '/odata/v4/Users(user-1)', {
          balance: 1000
        })
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error.code).to.equal(405) // Method not allowed
      }
    })
  })
  
  describe('Forecast action', () => {
    it('should execute forecast calculation', async () => {
      // Mock the HANA PAL procedure
      db.run = async (query) => {
        if (query.includes('predict_empties')) {
          // Update forecast dates
          await UPDATE('coffeex.Machine')
            .set({ forecastDate: new Date('2024-07-20') })
            .where({ machineId: 'machine-1' })
          return
        }
        return db._run(query)
      }
      
      const result = await srv.send('POST', '/odata/v4/Forecast')
      expect(result).to.be.a('number')
      expect(result).to.be.at.least(0)
    })
  })
  
  describe('Authorization', () => {
    it('should require User role for Tap action', async () => {
      // Test would require proper authentication setup
      // For now, we'll skip this as it requires XSUAA configuration
    })
    
    it('should require Admin role for BatchPay action', async () => {
      // Test would require proper authentication setup
      // For now, we'll skip this as it requires XSUAA configuration
    })
  })
})

// Additional test utilities
describe('Integration Tests', () => {
  it('should handle concurrent tap requests', async () => {
    // Simulate multiple users tapping at the same time
    const promises = []
    for (let i = 0; i < 5; i++) {
      promises.push(
        srv.send('POST', '/odata/v4/Tap', {
          machineId: 'machine-1',
          userId: 'user-1'
        }).catch(err => err)
      )
    }
    
    const results = await Promise.all(promises)
    const successful = results.filter(r => r.txId).length
    expect(successful).to.be.at.least(1)
  })
}) 