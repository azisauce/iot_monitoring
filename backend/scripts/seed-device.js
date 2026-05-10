require('dotenv').config();
const crypto = require('crypto');
const db = require('../src/db/db');

async function seed() {
  // 1. Find your tenant (the one you registered with)
  const tenant = await db('tenants').first();
  if (!tenant) {
    console.error('No tenant found. Register first via POST /auth/register');
    process.exit(1);
  }

  console.log(`Using tenant: ${tenant.name} (id: ${tenant.id})`);

  // 2. Check if device-001 already exists
  const existing = await db('devices').where({ device_id: 'device-001' }).first();

  if (existing) {
    // Just assign it to your tenant if it's orphaned
    const [updated] = await db('devices')
      .where({ device_id: 'device-001' })
      .update({
        tenant_id: tenant.id,
        device_key: existing.device_key || crypto.randomBytes(32).toString('hex'),
        status: 'active',
      })
      .returning('*');

    console.log('Updated existing device:');
    console.log(updated);
  } else {
    // Create fresh
    const [device] = await db('devices')
      .insert({
        device_id: 'device-001',
        name: 'Simulator Device',
        zone: 'Lab',
        tenant_id: tenant.id,
        device_key: crypto.randomBytes(32).toString('hex'),
        qr_secret: crypto.randomBytes(16).toString('hex'),
        status: 'active',
      })
      .returning('*');

    console.log('Created device:');
    console.log(device);
  }

  await db.destroy();
}

seed().catch(console.error);