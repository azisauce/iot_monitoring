const mqtt = require('mqtt');
const db = require('../db/db');

const { getIO } = require('../sockets/socketServer');

const MQTT_BROKER_URL = 'mqtt://localhost:1883';

const client = mqtt.connect(MQTT_BROKER_URL);

client.on('connect', () => {
  console.log('Connected to MQTT broker');

  client.subscribe('sensors/environment', (err) => {
    if (err) {
      console.error('MQTT subscription error:', err);
      return;
    }

    console.log('Subscribed to sensors/environment');
  });
});

client.on('message', async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());

    console.log('Received MQTT message:', payload);

    const {
      deviceId,
      temperature,
      humidity,
    } = payload;

    let device = await db('devices')
      .where({ device_id: deviceId })
      .first();

    if (!device) {
      const insertedDevices = await db('devices')
        .insert({
          device_id: deviceId,
          name: deviceId,
        })
        .returning('*');

      device = insertedDevices[0];
    }

    await db('measurements').insert({
      device_id: device.id,
      temperature,
      humidity,
    });

    getIO().emit('new-measurement', {
        deviceId,
        temperature,
        humidity,
    });

    if (temperature > 35) {
      await db('alerts').insert({
        device_id: device.id,
        message: `High temperature detected: ${temperature}°C`,
        severity: 'critical',
      });

      getIO().emit('new-alert', {
        message: `High temperature detected`,
        temperature,
      });
    }

    console.log('Measurement saved');
  } catch (error) {
    console.error('MQTT processing error:', error);
  }
});

module.exports = client;