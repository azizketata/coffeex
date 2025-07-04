const cds = require('@sap/cds')

module.exports = srv => {
  srv.on('Forecast', async req => {
    const db = await cds.tx(req)
    
    try {
      // Call HANA PAL stored procedure
      await db.run(`CALL "coffeex::predict_empties"()`)
      
      // Get updated forecast dates
      const rows = await db.read('coffeex.Machine', m => { 
        m.machineId, 
        m.forecastDate 
      })
      
      // Check for machines that will be empty within 24 hours
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const urgentMachines = rows.filter(m => 
        m.forecastDate && new Date(m.forecastDate) <= tomorrow
      )
      
      // Send alerts for urgent machines
      if (urgentMachines.length > 0) {
        try {
          const alerts = await cds.connect.to('alerting')
          for (const machine of urgentMachines) {
            alerts.emit('MACHINE_EMPTY_SOON', { 
              machineId: machine.machineId, 
              forecastDate: machine.forecastDate 
            })
          }
        } catch (err) {
          console.error('Alert notification failed:', err)
        }
      }
      
      return rows.length
    } catch (error) {
      console.error('Forecast calculation failed:', error)
      throw error
    }
  })
} 