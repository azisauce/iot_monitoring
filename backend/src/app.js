require('dotenv').config();

require('./mqtt/mqttClient');

const express = require('express');
const cors = require('cors');
const http = require('http');

const measurementsRoutes = require('./routes/measurementsRoutes');
const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');

const {
  initializeSocket,
} = require('./sockets/socketServer');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/measurements', measurementsRoutes);
app.use('/devices', deviceRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
  });
});

const server = http.createServer(app);

initializeSocket(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});