# Scaleway SQS Messaging Integration

This document describes how CoffeeX uses Scaleway's SQS-compatible messaging service as a replacement for SAP Event Mesh.

## Overview

Since SAP Event Mesh is not available in the current BTP environment, CoffeeX uses Scaleway Queues (SQS-compatible) for event-driven messaging. This enables:

- Refill event processing from IoT devices
- Asynchronous communication between services
- Event-driven alerts and notifications

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  IoT Devices    │────▶│ Scaleway Queue   │◀────│  CoffeeX App    │
│  (Refill Sensors)│     │  (SQS API)       │     │  (CAP Service)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Event Handlers  │
                        │  - RefillEvent   │
                        │  - Alerts        │
                        └──────────────────┘
```

## Configuration

### Environment Variables

```bash
# Scaleway SQS Configuration
SCALEWAY_ACCESS_KEY=It4rjFC3VR8c2MfRl1zz
SCALEWAY_SECRET_KEY=A7ym6TJlxTOFyvw8I45L4mNknf6NW252AAw3vX1JaKqNzuvrc5VBowWffLjaPLtb
SCALEWAY_QUEUE_URL=https://sqs.mnq.fr-par.scaleway.com/project-e9c9a739-08cc-40e1-849b-91d54e62c795/ucc-tum-coffee
SCALEWAY_SQS_ENDPOINT=https://sqs.mnq.fr-par.scaleway.com
USE_SCALEWAY_SQS=true
```

### Local Development

For local development, the app uses file-based messaging by default. To test with Scaleway SQS locally:

```bash
export USE_SCALEWAY_SQS=true
npm run watch
```

## Implementation Details

### 1. Scaleway SQS Adapter (`srv/integrations/scaleway-sqs.js`)

The adapter provides:
- AWS SDK v3 client configuration for Scaleway endpoint
- Message publishing via `emit()`
- Message consumption via long polling
- Event handler registration via `on()`

### 2. CAP Messaging Service (`srv/mocks/scaleway-messaging.js`)

Bridges CAP's messaging API to Scaleway SQS:
- Implements CAP's Service interface
- Forwards emit calls to Scaleway
- Maintains compatibility with CAP patterns

### 3. Refill Consumer (`srv/handlers/refillConsumer.js`)

Processes refill events from IoT devices:
- Updates machine bean levels
- Creates refill event records
- Triggers forecast recalculation

## Event Types

### RefillEvent

Sent when a machine is refilled with coffee beans.

```json
{
  "event": "RefillEvent",
  "data": {
    "machineId": "uuid",
    "qtyGram": 1000
  }
}
```

### Alert Events

Various alert types for monitoring:

```json
{
  "event": "LOW_BALANCE",
  "data": {
    "userId": "uuid",
    "balance": 2.50
  }
}
```

## Testing

### Manual Test

Run the test script to verify connectivity:

```bash
node test-scaleway-sqs.js
```

### Integration Test

Deploy to BTP and monitor logs:

```bash
cf logs coffeex-srv --recent | grep "Scaleway"
```

## Monitoring

### Queue Metrics

Monitor queue depth and message age in Scaleway Console:
- URL: https://console.scaleway.com/messaging/queues
- Queue: ucc-tum-coffee

### Application Logs

Key log patterns to monitor:
- `[Scaleway SQS] Sent` - Message published
- `[Scaleway SQS] Received` - Message consumed
- `[Scaleway SQS] Polling error` - Connection issues

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify environment variables are set
   - Check credentials in Scaleway Console

2. **Connection Timeouts**
   - Check network connectivity to Scaleway endpoint
   - Verify firewall rules allow HTTPS to sqs.mnq.fr-par.scaleway.com

3. **Message Not Processed**
   - Check if `USE_SCALEWAY_SQS=true` is set in production
   - Verify message format matches expected schema

### Debug Mode

Enable detailed logging:

```bash
cf set-env coffeex-srv LOG_LEVEL debug
cf restage coffeex-srv
```

## Cost Optimization

Florian mentioned to "only send as many messages as necessary" due to costs. Best practices:

1. Batch similar events when possible
2. Use appropriate polling intervals
3. Implement circuit breakers for failures
4. Monitor queue metrics for unusual activity

## Migration Notes

When SAP Event Mesh becomes available:

1. Update `.cdsrc-production.json` to use Event Mesh
2. Remove Scaleway environment variables
3. Update `refillConsumer.js` to remove Scaleway-specific code
4. Test thoroughly before switching production traffic 