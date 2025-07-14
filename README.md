# CoffeeX Backend - Smart Coffee Dispenser on SAP BTP

Backend service for the CoffeeX smart coffee dispenser system, built with SAP Cloud Application Programming Model (CAP).

## Overview

CoffeeX provides a cashless, tap-to-brew coffee experience with real-time analytics and automated refill forecasting. This backend service handles:

- NFC tap authentication and coffee dispensing
- Payment processing via PayPal
- Bean level tracking and refill event processing
- Machine usage forecasting using HANA PAL
- Real-time alerts for low balance and empty machines

## Architecture

- **Runtime**: Node.js 18+
- **Framework**: SAP CAP (Cloud Application Programming Model)
- **Database**: SAP HANA Cloud
- **Messaging**: Scaleway Queues (SQS-compatible)
- **Authentication**: SAP XSUAA
- **Payment**: PayPal REST API
- **Device Control**: Switch-Bot API
- **Deployment**: Cloud Foundry on SAP BTP

## Prerequisites

- Node.js 18 or higher
- SAP CAP development kit: `npm i -g @sap/cds-dk`
- Cloud Foundry CLI
- Access to SAP BTP account with required services

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run locally with in-memory SQLite**:
   ```bash
   npm run watch
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

## API Endpoints

### OData V4 Service

Base URL: `/odata/v4`

#### Entities
- `GET /Users` - List all users (read-only)
- `GET /Machines` - List all machines (read-only)
- `GET/POST/PATCH/DELETE /CoffeeTxes` - Manage coffee transactions
- `GET/POST/PATCH/DELETE /RefillEvents` - Manage refill events

#### Actions
- `POST /Tap` - Dispense coffee (requires User role)
  ```json
  {
    "machineId": "uuid",
    "userId": "uuid"
  }
  ```

- `POST /BatchPay` - Process pending payments (requires Admin role)
- `POST /Forecast` - Update machine forecasts (requires Admin role)

### Health Endpoints

- `GET /health` - Complete health check
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe

## Configuration

### Environment Variables

```bash
# PayPal Integration
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret

# Switch-Bot Integration
SWITCHBOT_API_URL=https://api.switch-bot.com/v1.1
SWITCHBOT_TOKEN=your-token
SWITCHBOT_SECRET=your-secret

# Scaleway Messaging (Production)
SCALEWAY_ACCESS_KEY=your-access-key
SCALEWAY_SECRET_KEY=your-secret-key
SCALEWAY_QUEUE_URL=https://sqs.mnq.fr-par.scaleway.com/project-id/queue-name
SCALEWAY_SQS_ENDPOINT=https://sqs.mnq.fr-par.scaleway.com
USE_SCALEWAY_SQS=true

# Logging
LOG_LEVEL=info
```

### Local Service Bindings

Create `.cdsrc-private.json` for local development:
```json
{
  "requires": {
    "db": {
      "credentials": {
        "database": "coffeex.db"
      }
    }
  }
}
```

## Deployment

### Build
```bash
npm run build
mbt build
```

### Deploy to Cloud Foundry (Windows PowerShell)
```powershell
./deploy-to-btp.ps1
```

### Deploy to Cloud Foundry (Linux/Mac)
```bash
./deploy-to-btp.sh
```

### Required BTP Services
- HANA Cloud (hana-cloud-free)
- Alert Notification (standard)
- XSUAA (application)

### External Services
- Scaleway Queues - For event messaging (SQS-compatible)
- PayPal - For payment processing
- Switch-Bot - For device control

## Project Structure

```
coffeex/
├── db/                 # Domain model
│   └── schema.cds      # Entity definitions
├── srv/                # Service layer
│   ├── coffee-service.cds   # Service definition
│   ├── coffee-service.js    # Service implementation
│   ├── handlers/       # Action handlers
│   │   ├── tap.js
│   │   ├── batchPay.js
│   │   ├── forecast.js
│   │   └── refillConsumer.js
│   ├── integrations/   # External service integrations
│   │   ├── switchbot.js
│   │   ├── paypal.js
│   │   └── scaleway-sqs.js
│   └── server.js       # Server configuration
├── jobs/               # Scheduled jobs
│   ├── cron.cds        # Job definitions
│   └── runner.js       # Job scheduler
├── test/               # Unit tests
│   └── coffee-service.test.js
├── docs/               # Documentation
│   └── openapi.yaml    # API specification
└── mta.yaml            # Multi-target application descriptor
```

## Scheduled Jobs

- **BatchPay**: Runs hourly to process pending transactions
- **Forecast**: Runs daily at 3 AM CEST to update machine forecasts

## Security

- JWT-based authentication via SAP Identity Service
- Role-based access control (User, Admin)
- Input validation on all endpoints
- Secure credential storage via BTP service bindings

## Monitoring

- Structured JSON logging with Winston
- Alert Notification integration for critical events
- Health endpoints for Kubernetes probes
- Application logs available via `cf logs coffeex-srv`

## Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Run tests: `npm test`
4. Build: `npm run build`
5. Create pull request
6. CI/CD pipeline deploys to dev space after merge


## Hardware

### SwitchBot

#### SwitchBot Account Details
- Email: coffeex.tum@gmail.com
- PW: coffee@tum2025

#### SwitchBot Device Details
SwitchBot Device ID: CD3430374B90
SwitchBot Hub ID: Currently not in use.

### Coffee Machine
Machine UUID [5bd4f91f-d9b4-4573-88df-11b2f14e7c78] is mocked and linked to Switch-Bot device ID [CD3430374B90] during setup.

### NFC Tags
#### Tag 1
Routing to https://our-frontend-app.com/tap?machineId=5bd4f91f-d9b4-4573-88df-11b2f14e7c78

#### Tag 2
Currently not in use.

#### Tag 3
Currently not in use.




## License

Copyright (c) 2024 CoffeeX Team. All rights reserved.