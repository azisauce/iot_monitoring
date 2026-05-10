const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', () => {
  console.log('Simulator connected to MQTT');

  setInterval(() => {
    const payload = {
      deviceId: 'device-001',
      temperature: Math.floor(Math.random() * 15) + 20,
      humidity: Math.floor(Math.random() * 30) + 40,
    };

    client.publish(
      'sensors/environment',
      JSON.stringify(payload)
    );

    console.log('Published:', payload);
  }, 5000);
});