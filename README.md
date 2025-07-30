# CoffeeX ☕ - Smart Coffee Dispenser Platform

<p align="center">
  <img src="assets/logo.png" alt="CoffeeX Logo" width="200"/>
</p>

<p align="center">
  <strong>A cloud-native, NFC-enabled coffee management system built on SAP Business Technology Platform</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#api-documentation">API</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Frontend Routes](#frontend-routes)
- [Deployment](#deployment)
- [Testing](#testing)
- [Hardware Setup](#hardware-setup)
- [Known Issues](#known-issues)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

CoffeeX is an enterprise-grade coffee management platform that revolutionizes the workplace coffee experience. By combining NFC technology, cloud computing, and IoT devices, CoffeeX provides a seamless, cashless coffee ordering system with real-time analytics and automated inventory management.

### Key Highlights

- **🏷️ NFC Tag Integration**: Tap to select coffee machines instantly
- **💳 Cashless Payments**: Integrated PayPal for balance top-ups
- **📊 Real-time Analytics**: Track consumption patterns and forecast bean usage
- **🔔 Smart Notifications**: Low balance alerts and refill reminders
- **🎨 Modern UI**: Responsive SAPUI5 interface with role-based dashboards
- **☁️ Cloud Native**: Fully deployed on SAP Business Technology Platform

## ✨ Features

### For Users
- **Quick Coffee Ordering**
  - NFC tap to select machine
  - Single/Double shot selection
  - Real-time balance checking
  - Order confirmation with animations

- **Profile Management**
  - View current balance
  - Transaction history
  - Personal consumption analytics
  - Monthly coffee trends visualization

- **Smart Features**
  - Low balance notifications (≤ €5)
  - Machine status indicators
  - Bean level monitoring
  - Location-based machine selection

### For Administrators
- **Dashboard Analytics**
  - User statistics
  - Machine performance metrics
  - Revenue tracking
  - Monthly order trends

- **Machine Management**
  - Real-time bean level monitoring
  - One-click refill updates
  - Batch bean level management
  - Forecast-based refill planning

- **Predictive Analytics**
  - Bean consumption forecasting
  - Refill need predictions
  - Usage pattern analysis
  - Machine-specific insights

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │   SAPUI5    │  │  Approuter   │  │   XSUAA (Auth)     │   │
│  │  Web App    │  │              │  │                     │   │
│  └─────────────┘  └──────────────┘  └─────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS
┌─────────────────────────────┴───────────────────────────────────┐
│                          Backend Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │  SAP CAP    │  │  OData V4    │  │   Business Logic    │   │
│  │  Service    │  │  APIs        │  │   & Handlers        │   │
│  └─────────────┘  └──────────────┘  └─────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────────┐
│                       Integration Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │   PayPal    │  │  SwitchBot   │  │  Scaleway SQS      │   │
│  │   API       │  │  IoT API     │  │  Messaging         │   │
│  └─────────────┘  └──────────────┘  └─────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────────┐
│                        Data Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    SAP HANA Cloud                        │   │
│  │  ┌─────────┐  ┌──────────┐  ┌────────────┐            │   │
│  │  │  Users  │  │ Machines │  │ CoffeeTx   │            │   │
│  │  └─────────┘  └──────────┘  └────────────┘            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: SAPUI5 1.60+
- **Router**: SAP Approuter
- **Styling**: Custom CSS with animations
- **Charts**: SAP Viz library
- **Icons**: SAP Icon set + Custom SVGs

### Backend
- **Runtime**: Node.js 18+
- **Framework**: SAP CAP (Cloud Application Programming Model)
- **Protocol**: OData V4
- **Database**: SAP HANA Cloud
- **Authentication**: SAP XSUAA (JWT-based)

### External Services
- **Payment**: PayPal REST API
- **IoT Control**: SwitchBot API
- **Messaging**: Scaleway SQS
- **Deployment**: SAP BTP Cloud Foundry

## 📁 Project Structure

```
coffeex/
├── 📂 simple-approuter/          # Frontend application
│   ├── 📂 frontend/webapp/       # SAPUI5 web application
│   │   ├── 📂 controller/        # View controllers
│   │   │   ├── 📂 user/         # User portal controllers
│   │   │   └── 📂 admin/        # Admin portal controllers
│   │   ├── 📂 view/             # XML views
│   │   │   ├── 📂 user/         # User portal views
│   │   │   └── 📂 admin/        # Admin portal views
│   │   ├── 📂 css/              # Stylesheets
│   │   ├── 📂 assets/           # Images and icons
│   │   ├── Component.js         # UI5 component
│   │   ├── manifest.json        # App descriptor
│   │   └── index.html          # Entry point
│   ├── xs-app.json             # Approuter config
│   └── package.json
│
├── 📂 srv/                      # Backend service layer
│   ├── coffee-service.cds       # Service definitions
│   ├── coffee-service.js        # Service implementation
│   ├── server.js               # Express server config
│   ├── 📂 handlers/            # Action handlers
│   │   ├── tap.js              # Coffee ordering
│   │   ├── topUp.js            # Balance top-up
│   │   └── forecast.js         # Analytics
│   └── 📂 integrations/        # External services
│       ├── paypal.js
│       ├── switchbot.js
│       └── scaleway-sqs.js
│
├── 📂 db/                      # Database layer
│   ├── schema.cds              # Entity definitions
│   ├── views.cds               # Database views
│   └── 📂 data/               # Test data (CSV)
│
├── 📂 test/                    # Test suites
├── 📂 docs/                    # Documentation
├── mta.yaml                    # Multi-target app config
├── package.json                # Node.js dependencies
└── xs-security.json            # XSUAA security config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- SAP CAP development kit
- Cloud Foundry CLI
- SAP BTP account with subaccount
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/coffeex.git
   cd coffeex
   ```

2. **Install CAP tools globally**
   ```bash
   npm install -g @sap/cds-dk
   ```

3. **Install dependencies**
   ```bash
   npm install
   cd simple-approuter && npm install
   cd ..
   ```

4. **Run locally**
   ```bash
   # Terminal 1: Start backend
   npm run watch

   # Terminal 2: Start approuter (optional)
   cd simple-approuter
   npm start
   ```

5. **Access the application**
   - Backend: http://localhost:4004
   - Frontend: http://localhost:5000

### Default Test Users

| Email | Password | Role | Balance |
|-------|----------|------|---------|
| ge34ram@mytum.de | - | Admin | €50.00 |
| test.student@sap.com | - | User | €12.50 |

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# PayPal Configuration
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-secret

# SwitchBot IoT
SWITCHBOT_API_URL=https://api.switch-bot.com/v1.1
SWITCHBOT_TOKEN=your-token
SWITCHBOT_SECRET=your-secret

# Messaging Queue (Production)
SCALEWAY_ACCESS_KEY=your-key
SCALEWAY_SECRET_KEY=your-secret
SCALEWAY_QUEUE_URL=https://sqs.mnq.fr-par.scaleway.com/queue
USE_SCALEWAY_SQS=true

# Development
LOG_LEVEL=info
NODE_ENV=development
```

### Security Configuration

The `xs-security.json` defines roles and scopes:

```json
{
  "xsappname": "coffeex",
  "tenant-mode": "dedicated",
  "scopes": [
    { "name": "$XSAPPNAME.User", "description": "User access" },
    { "name": "$XSAPPNAME.Admin", "description": "Admin access" }
  ],
  "role-templates": [
    { "name": "User", "scope-references": ["$XSAPPNAME.User"] },
    { "name": "Admin", "scope-references": ["$XSAPPNAME.Admin", "$XSAPPNAME.User"] }
  ]
}
```

## 📡 API Documentation

### OData V4 Endpoints

Base URL: `/backend/odata/v4/`

#### Entities

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/Users` | GET | List all users | ✅ |
| `/Machines` | GET | List machines | ✅ |
| `/Machines(id)` | PATCH | Update machine | ✅ Admin |
| `/CoffeeTx` | GET | Get transactions | ✅ |
| `/TopUpTransactions` | GET | Get top-ups | ✅ |

#### Actions

| Endpoint | Method | Payload | Description |
|----------|--------|---------|-------------|
| `/Tap` | POST | `{machineId, userId, coffeeType}` | Order coffee |
| `/TopUp` | POST | `{amount}` | Add balance |
| `/ForecastBeans` | POST | - | Get bean forecast |
| `/getCurrentUser` | GET | - | Get user info |

### Health Endpoints

- `GET /health` - Application health check
- `GET /health/live` - Kubernetes liveness probe
- `GET /health/ready` - Kubernetes readiness probe

## 🗺️ Frontend Routes

### User Portal
- `/` - Landing page (redirects based on role)
- `/#/user/home` - User dashboard
- `/#/user/profile` - User profile
- `/#/user/history` - Transaction history
- `/#/user/consumption` - Personal analytics

### Admin Portal
- `/#/admin/home` - Admin dashboard
- `/#/admin/dashboard` - Analytics dashboard

### NFC Integration
- `/?machineId={uuid}` - Direct machine selection via NFC

## 🚢 Deployment

### Build the Application

```bash
# Build the MTA archive
mbt build -t ./
```

### Deploy to SAP BTP

**Windows PowerShell:**
```powershell
./deploy-to-btp.ps1
```

**Linux/macOS:**
```bash
./deploy-to-btp.sh
```

### Manual Deployment Steps

1. **Deploy database module**
   ```bash
   cf deploy coffeex-db.mtar
   ```

2. **Deploy backend service**
   ```bash
   cd srv
   cf push coffeex-srv
   ```

3. **Deploy approuter**
   ```bash
   cd simple-approuter
   cf push coffeex-approuter
   ```

### Required BTP Services

- **hana**: HANA Cloud database
- **xsuaa**: Authentication & Authorization
- **connectivity**: For external API calls
- **destination**: Service destinations

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Manual Testing

1. **Test NFC Flow**
   ```powershell
   ./test-nfc-routing.ps1
   ```

2. **Test Backend Endpoints**
   ```powershell
   ./test-btp-endpoints.ps1
   ```

## 🔧 Hardware Setup

### Coffee Machine
- **Machine UUID**: `5bd4f91f-d9b4-4573-88df-11b2f14e7c78`
- **Location**: TUM SAP UCC - Building A

### SwitchBot Integration
- **Device ID**: `CD3430374B90`
- **Account**: coffeex.tum@gmail.com

### NFC Tags
Configure NFC tags to redirect to:
```
https://your-app-url.cfapps.eu10.hana.ondemand.com/?machineId={machine-uuid}
```

## 🐛 Known Issues

1. **Component-preload.js 404**: This is a UI5 optimization file, safe to ignore in development
2. **favicon.ico 404**: Missing favicon, cosmetic issue only
3. **CSRF Token**: Some older browsers may have issues with CSRF token handling

## 🗓️ Roadmap

### Phase 1 (Current)
- ✅ Core coffee ordering system
- ✅ NFC integration
- ✅ Basic analytics
- ✅ PayPal integration

### Phase 2 (Q2 2025)
- [ ] Mobile app (iOS/Android)
- [ ] Multiple payment providers
- [ ] Advanced ML-based forecasting
- [ ] Multi-tenant support

### Phase 3 (Q3 2025)
- [ ] Voice ordering (Alexa/Google)
- [ ] Loyalty program
- [ ] Coffee preference learning
- [ ] API marketplace

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use ESLint configuration
- Follow SAP CAP best practices
- Write meaningful commit messages
- Add tests for new features

## 📄 License

Copyright (c) 2024-2025 CoffeeX Team, TUM SAP University Competence Center

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ☕ and ❤️ by the CoffeeX Team
</p>

<p align="center">
  <a href="https://github.com/your-org/coffeex/issues">Report Bug</a> •
  <a href="https://github.com/your-org/coffeex/issues">Request Feature</a> •
  <a href="mailto:coffeex.tum@gmail.com">Contact Us</a>
</p>