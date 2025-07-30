const cds = require('@sap/cds');

module.exports = srv => {
  srv.on('ForecastBeans', async req => {
    const db = await cds.tx(req);
    
    try {
      // Get all machines
      const machines = await db.read('coffeex.Machine');
      
      // Get coffee transactions from last 3 months for trend analysis
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const transactions = await db.read('coffeex.CoffeeTx')
        .where({ createdAt: { '>=': threeMonthsAgo.toISOString() } })
        .orderBy('createdAt');
      
      const results = [];
      
      for (const machine of machines) {
        // Filter transactions for this machine
        const machineTxs = transactions.filter(tx => tx.machineId === machine.machineId);
        
        // Count coffee types in last month (for more recent trend)
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const lastMonthTxs = machineTxs.filter(tx => 
          new Date(tx.createdAt) >= oneMonthAgo
        );
        
        // Calculate coffee counts
        const normalCount = lastMonthTxs.filter(tx => 
          tx.coffeeType === 'NORMAL' || !tx.coffeeType
        ).length;
        const doubleCount = lastMonthTxs.filter(tx => 
          tx.coffeeType === 'DOUBLE'
        ).length;
        
        // Calculate average daily consumption
        const daysInLastMonth = 30;
        const avgNormalPerDay = normalCount / daysInLastMonth;
        const avgDoublePerDay = doubleCount / daysInLastMonth;
        
        // Project for next month (30 days)
        const projectedNormal = Math.ceil(avgNormalPerDay * 30);
        const projectedDouble = Math.ceil(avgDoublePerDay * 30);
        
        // Calculate total beans needed
        const normalBeansNeeded = projectedNormal * 7; // 7g per normal
        const doubleBeansNeeded = projectedDouble * 14; // 14g per double
        const totalBeansNeeded = normalBeansNeeded + doubleBeansNeeded;
        
        // Calculate refills needed (assuming 1kg = 1000g per refill)
        const currentLevel = machine.beanLevel || 0;
        const beansToOrder = Math.max(0, totalBeansNeeded - currentLevel);
        const refillsNeeded = Math.ceil(beansToOrder / 1000);
        
        results.push({
          machineId: machine.machineId,
          location: machine.location,
          currentBeanLevel: currentLevel,
          estimatedBeansNextMonth: totalBeansNeeded,
          estimatedRefillsNeeded: refillsNeeded,
          normalCoffees: projectedNormal,
          doubleCoffees: projectedDouble
        });
      }
      
      return results;
      
    } catch (error) {
      console.error('Bean forecast calculation failed:', error);
      throw error;
    }
  });
};