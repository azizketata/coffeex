const cds = require('@sap/cds');

module.exports = srv => {
  srv.on('Tap', async ({ data, req }) => {
    const { machineId, userId, coffeeType = 'NORMAL' } = data;
    const db = await cds.tx(req);

    // Validate machine exists
    const [machine] = await db.read('Machines').where({ machineId });
    if (!machine) return req.error(404, `Unknown machine: ${machineId}`);

    // Validate user exists
    const [user] = await db.read('Users').where({ userId });
    if (!user) return req.error(404, 'Unknown user');

    // Determine price and beans based on coffee type
    const isDouble = coffeeType === 'DOUBLE';
    const price = isDouble ? 3.0 : 1.5;
    const beansUsed = isDouble ? 14 : 7; // grams

    // Check balance
    if (user.balance < price) return req.error(403, 'Insufficient balance');

    // Check if machine has enough beans
    if (machine.beanLevel < beansUsed) return req.error(409, 'Machine needs refill');

    // Create transaction
    const tx = {
      txId: cds.utils.uuid(),
      userId,
      machineId,
      price,
      paymentStatus: 'OPEN',
      coffeeType,
      beansUsed
    };

    await db.run(INSERT.into('CoffeeTx').entries(tx));
    
    // Update machine bean level
    await db.run(UPDATE('Machines')
      .set({ beanLevel: machine.beanLevel - beansUsed })
      .where({ machineId }));

    // Fire-and-forget: trigger SwitchBot
    cds.spawn(require('../integrations/switchbot').brew(machineId));

    // Optional: alert if balance low
    if (user.balance < 5) {
      try {
        const alerts = await cds.connect.to('alerting');
        alerts.emit('LOW_BALANCE', { userId, balance: user.balance });
      } catch (err) {
        console.error('Alert notification failed:', err);
      }
    }

    return tx;
  });
};