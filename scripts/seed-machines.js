const cds = require('@sap/cds');

const machines = [
    {
        machineId: '5bd4f91f-d9b4-4573-88df-11b2f14e7c78',
        location: 'TUM SAP UCC',
        beanLevel: 1000,
        forecastDate: null  // Can be set later via forecast action
    }
    // We could add more machines here
];

async function seedMachines() {
    const db = await cds.connect.to('db');

    console.log('Seeding Machine Data...');

    // Optional: delete existing data first (for clean resets)
    await db.run(DELETE.from('coffeex.Machine'));

    // Insert the new seed data
    await db.run(INSERT.into('coffeex.Machine').entries(machines));

    console.log(`Seeded ${machines.length} machine(s) successfully`);
}

seedMachines()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Seeding machines failed:', err);
        process.exit(1);
    });
