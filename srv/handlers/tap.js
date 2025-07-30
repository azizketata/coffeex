const cds = require('@sap/cds');

module.exports = srv => {
  srv.on('Tap', async ({ data, req }) => {
    const { machineId, userId, coffeeType = 'NORMAL' } = data;
    const db = await cds.tx(req);
    
    // Get service entities
    const { Machines, Users, CoffeeTx } = srv.entities;

    // Validate machine exists
    const [machine] = await db.read(Machines).where({ machineId });
    if (!machine) {
      req.error(404, `Unknown machine: ${machineId}`);
      return;
    }

    // Validate user exists
    const [user] = await db.read(Users).where({ userId });
    if (!user) {
      req.error(404, 'Unknown user');
      return;
    }

    // Determine price and beans based on coffee type
    const isDouble = coffeeType === 'DOUBLE';
    const price = isDouble ? 3.0 : 1.5;
    const beansUsed = isDouble ? 14 : 7; // grams

    // Check balance
    if (user.balance < price) {
      req.error(403, 'Insufficient balance');
      return;
    }

    // Check if machine has enough beans
    if (machine.beanLevel < beansUsed) {
      req.error(409, 'Machine needs refill');
      return;
    }

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

    await db.run(INSERT.into(CoffeeTx).entries(tx));
    
    // Update machine bean level
    await db.run(UPDATE(Machines)
      .set({ beanLevel: machine.beanLevel - beansUsed })
      .where({ machineId }));
    
    // Ensure transaction is committed
    await db.commit();

    // Fire-and-forget: trigger SwitchBot
    const switchbot = require('../integrations/switchbot');
    setTimeout(() => {
      switchbot.brew(machineId).catch(err => {
        console.error('SwitchBot trigger failed:', err);
      });
    }, 0);

    // Optional: alert if balance low
    if (user.balance < 5) {
      setTimeout(() => {
        console.log('[LOW_BALANCE] User has low balance:', { userId, balance: user.balance });
      }, 0);
    }

    return tx;
  });
};