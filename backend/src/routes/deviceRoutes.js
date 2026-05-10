const express = require('express');
const crypto = require('crypto');
const db = require('../db/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// All device routes require auth
router.use(requireAuth);

/**
 * GET /devices
 * List all devices belonging to the current tenant
 */
router.get('/', async (req, res) => {
  try {
    const devices = await db('devices')
      .where({ tenant_id: req.user.tenant_id })
      .orderBy('created_at', 'desc');

    res.json(devices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

/**
 * POST /devices
 * Register a new device under the current tenant
 * Body: { name, zone? }
 * Role: admin or technician
 */
router.post('/', requireRole('admin', 'technician'), async (req, res) => {
  const { name, zone } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  // Generate a unique device_id and secret keys
  const device_id = `dev-${crypto.randomBytes(4).toString('hex')}`;
  const device_key = crypto.randomBytes(32).toString('hex');
  const qr_secret = crypto.randomBytes(16).toString('hex');

  try {
    const [device] = await db('devices')
      .insert({
        device_id,
        name,
        zone: zone || null,
        tenant_id: req.user.tenant_id,
        device_key,
        qr_secret,
        status: 'inactive',
      })
      .returning('*');

    res.status(201).json(device);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

/**
 * PATCH /devices/:id/status
 * Update device status: active | inactive | maintenance
 * Role: admin or technician
 */
router.patch('/:id/status', requireRole('admin', 'technician'), async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['active', 'inactive', 'maintenance'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const [device] = await db('devices')
      .where({ id: req.params.id, tenant_id: req.user.tenant_id }) // tenant-scoped!
      .update({ status })
      .returning('*');

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json(device);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update device status' });
  }
});

/**
 * DELETE /devices/:id
 * Role: admin only
 */
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const deleted = await db('devices')
      .where({ id: req.params.id, tenant_id: req.user.tenant_id })
      .delete();

    if (!deleted) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

module.exports = router;