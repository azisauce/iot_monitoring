# IoT Monitoring (Backend + Frontend)

A simple IoT monitoring stack:
- Backend: Express + MQTT + Socket.IO + Knex + PostgreSQL
- Frontend: Angular dashboard
- Optional simulator: publishes sample MQTT sensor data

## What Runs Where

- Backend API + Socket.IO: http://localhost:3000
- Frontend UI: http://localhost:4200
- MQTT broker: mqtt://localhost:1883
- PostgreSQL: localhost:5432

## Prerequisites (Windows)

Install these on your Windows laptop:
- Git (for cloning the repo)
- Node.js 20+ (includes npm)
- PostgreSQL 14+ (plus psql or pgAdmin)
- Mosquitto MQTT broker

Notes:
- The backend uses Node + Express and connects to PostgreSQL.
- The frontend uses Angular and expects the backend at http://localhost:3000.
- The MQTT broker must be running on port 1883 for live data.

## Download the Project

Open PowerShell and run:

```powershell
git clone <YOUR_REPO_URL>
cd Iot
```

## Backend Setup (Windows)

### 1) Configure environment variables

The backend loads config from backend/.env. Update it to match your local PostgreSQL credentials:

```env
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=iot_monitoring
```

### 2) Install backend dependencies

```powershell
cd backend
npm install
```

### 3) Create the database

If you use psql:

```powershell
psql -U postgres -c "CREATE DATABASE iot_monitoring;"
```

If you use pgAdmin, create a database named iot_monitoring.

### 4) Run database migrations

```powershell
npx knex migrate:latest
```

### 5) Start the backend API

```powershell
npm run dev
```

The backend exposes:
- GET /health
- GET /measurements/latest
- GET /measurements/history
- GET /measurements/alerts

## MQTT Broker (Windows)

Install Mosquitto and start the broker on port 1883.

If Mosquitto is on your PATH:

```powershell
mosquitto -v
```

Keep it running while the backend and simulator are active.

## Frontend Setup (Windows)

### 1) Install frontend dependencies

```powershell
cd ..\frontend
npm install
```

### 2) Start the frontend

```powershell
npm start
```

Open http://localhost:4200 in your browser.

## Run the Device Simulator (Optional)

This publishes random temperature/humidity data every 5 seconds.

```powershell
cd ..\backend
node src\simulators\deviceSimulator.js
```

## Typical Run Order

1) Start PostgreSQL service
2) Start Mosquitto (MQTT broker)
3) Start backend (npm run dev)
4) Start frontend (npm start)
5) Start simulator (node src\simulators\deviceSimulator.js)

## Troubleshooting

- Backend cannot connect to DB: check backend/.env values and confirm PostgreSQL is running.
- Frontend shows no data: confirm backend is running on port 3000 and the simulator is publishing.
- Socket connection errors: ensure the backend is running and not blocked by firewall.
- Port conflicts: change PORT in backend/.env and update the frontend API URL in frontend/src/app/services/measurement.service.ts.

## Project Notes

- MQTT topic: sensors/environment
- Socket events:
  - new-measurement
  - new-alert
