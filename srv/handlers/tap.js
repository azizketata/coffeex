srv.on('Tap', async ({ data, req }) => {
  const { machineId, userId, coffeeType } = data
  const db = await cds.tx(req)

  const priceMap = {
    single: 1.5,
    double: 3
  }

  const price = priceMap[coffeeType]
  if (!price) return req.error(400, 'Invalid coffee type')

  const [machine] = await db.read('coffeex.Machine').where({ machineId })
  if (!machine) return req.error(404, `Unknown machine: ${machineId}`)

  const [user] = await db.read('coffeex.User').where({ userId })
  if (!user) return req.error(404, 'Unknown user')

  if (user.balance < price) return req.error(400, 'Insufficient balance')

  const tx = {
    txId: cds.utils.uuid(),
    userId,
    machineId,
    price, // this is either 1.5 or 3
    paymentStatus: 'OPEN'
  }

  await db.run(INSERT.into('coffeex.CoffeeTx').entries(tx))

  await db.run(
    UPDATE('coffeex.User').set`balance = balance - ${price}`.where({ userId })
  )

  cds.spawn(require('../integrations/switchbot').brew(machineId))

  const newBalance = user.balance - price
  if (newBalance < 5) {
    try {
      const alerts = await cds.connect.to('alerting')
      alerts.emit('LOW_BALANCE', { userId, balance: newBalance })
    } catch (err) {
      console.error('Alert notification failed:', err)
    }
  }

  return tx
})
