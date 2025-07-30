const cds = require('@sap/cds');

module.exports = srv => {
  srv.on('Tap', async ({ data, req }) => {
    const { machineId, userId } = data;
    const db = await cds.tx(req);

    // Validate machine exists
    const [machine] = await db.read('coffeex.Machine').where({ machineId });
    if (!machine) return req.error(404, `Unknown machine: ${machineId}`);

    // Validate user exists
    const [user] = await db.read('coffeex.User').where({ userId });
    if (!user) return req.error(404, 'Unknown user');

    // Check balance
    if (user.balance < 1.5) return req.error(403, 'Insufficient balance');

    // Create transaction
    const tx = {
      txId: cds.utils.uuid(),
      userId,
      machineId,
      price: 1.5,
      paymentStatus: 'OPEN',
    };

    await db.run(INSERT.into('coffeex.CoffeeTx').entries(tx));

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