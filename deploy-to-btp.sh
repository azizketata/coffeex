#!/bin/bash

# CoffeeX BTP Deployment Script
# This script deploys the CoffeeX app to SAP BTP with proper HANA configuration

echo "🚀 CoffeeX BTP Deployment"
echo "========================="

# Stop app if running
echo "⏹️ Stopping app if running..."
cf stop coffeex-srv || true

# Set environment variables for HANA
echo ""
echo "🔧 Setting environment variables..."
cf set-env coffeex-srv CDS_ENV production
cf set-env coffeex-srv NODE_ENV production
cf set-env coffeex-srv cds_requires_db_kind hana-cloud

# Set Scaleway SQS environment variables
echo ""
echo "🔐 Setting Scaleway SQS credentials..."
cf set-env coffeex-srv SCALEWAY_ACCESS_KEY "It4rjFC3VR8c2MfRl1zz"
cf set-env coffeex-srv SCALEWAY_SECRET_KEY "A7ym6TJlxTOFyvw8I45L4mNknf6NW252AAw3vX1JaKqNzuvrc5VBowWffLjaPLtb"
cf set-env coffeex-srv SCALEWAY_QUEUE_URL "https://sqs.mnq.fr-par.scaleway.com/project-e9c9a739-08cc-40e1-849b-91d54e62c795/ucc-tum-coffee"
cf set-env coffeex-srv SCALEWAY_SQS_ENDPOINT "https://sqs.mnq.fr-par.scaleway.com"
cf set-env coffeex-srv USE_SCALEWAY_SQS "true"

# Create production config
echo ""
echo "📝 Creating production configuration..."
cat > .cdsrc-production.json << 'EOF'
{
  "build": {
    "target": "gen"
  },
  "requires": {
    "db": {
      "kind": "hana-cloud"
    },
    "auth": {
      "kind": "mocked"
    },
    "messaging": {
      "impl": "./srv/mocks/scaleway-messaging.js",
      "kind": "scaleway-sqs"
    },
    "alerting": {
      "kind": "alert-notification"
    }
  },
  "features": {
    "serve_on_root": true
  }
}
EOF

# Push the app
echo ""
echo "🚀 Deploying app to BTP..."
cf push coffeex-srv \
  -p . \
  -m 512M \
  -k 1G \
  -b nodejs_buildpack \
  --no-start

# Start the app
echo ""
echo "▶️ Starting app..."
cf start coffeex-srv

echo ""
echo "✅ Deployment complete!"
echo "📍 Check your app at: https://$(cf app coffeex-srv | grep routes | awk '{print $2}')"
echo ""
echo "📊 Monitor logs with: cf logs coffeex-srv --recent" 