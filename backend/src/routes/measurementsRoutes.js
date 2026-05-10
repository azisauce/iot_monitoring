const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { requireAuth } = require('../middleware/auth');

// Protect all measurement routes
router.use(requireAuth);

router.get('/latest', async (req, res) => {
  try {
    const measurement = await db('measurements')
      .join('devices', 'measurements.device_id', 'devices.id')
      .where('measurements.tenant_id', req.user.tenant_id) // tenant-scoped
      .select('measurements.*', 'devices.device_id as deviceId', 'devices.name as deviceName')
      .orderBy('measurements.created_at', 'desc')
      .first();

    res.json(measurement || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch measurements' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const measurements = await db('measurements')
      .join('devices', 'measurements.device_id', 'devices.id')
      .where('measurements.tenant_id', req.user.tenant_id) // tenant-scoped
      .select('measurements.*', 'devices.device_id as deviceId', 'devices.name as deviceName')
      .orderBy('measurements.created_at', 'desc')
      .limit(20);

    res.json(measurements.reverse());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const alerts = await db('alerts')
      .join('devices', 'alerts.device_id', 'devices.id')
      .where('alerts.tenant_id', req.user.tenant_id) // tenant-scoped
      .select(
        'alerts.id',
        'alerts.message',
        'alerts.severity',
        'alerts.type',
        'alerts.resolved',
        'alerts.created_at',
        'devices.device_id as deviceId',
        'devices.name as deviceName'
      )
      .orderBy('alerts.created_at', 'desc')
      .limit(50);

    res.json(alerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

module.exports = router;