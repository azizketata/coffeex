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
      "kind": "file-based-messaging"
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