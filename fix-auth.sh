#!/bin/bash

# Fix Authentication Configuration for CoffeeX
echo "🔐 Fixing CoffeeX Authentication Configuration"
echo "============================================="

# Stop the backend service
echo ""
echo "⏹️ Stopping backend service..."
cf stop coffeex-srv

# Create proper production configuration with XSUAA
echo ""
echo "📝 Creating production configuration with XSUAA..."
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
      "kind": "xsuaa"
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

# Push the configuration to the server
echo ""
echo "📤 Pushing production configuration..."
cp .cdsrc-production.json gen/srv/.cdsrc.json

# Update environment to ensure XSUAA is used
echo ""
echo "🔧 Setting authentication environment variables..."
cf set-env coffeex-srv CDS_ENV production
cf set-env coffeex-srv NODE_ENV production
cf set-env coffeex-srv cds_requires_auth_kind xsuaa

# Restage to apply changes
echo ""
echo "🔄 Restaging backend service..."
cf restage coffeex-srv

# Wait for restaging
echo ""
echo "⏳ Waiting for restaging to complete..."
sleep 30

# Start the service
echo ""
echo "▶️ Starting backend service..."
cf start coffeex-srv

# Check the status
echo ""
echo "📊 Checking service status..."
cf app coffeex-srv

echo ""
echo "✅ Authentication fix complete!"
echo ""
echo "🧪 Test the authentication flow:"
echo "1. Open: https://technische-universit-t-m-nchen-sap-hochschulkompetenzzenea81862.cfapps.us10-001.hana.ondemand.com/"
echo "2. Login with your credentials"
echo "3. Try the TopUp or other backend functions"
echo ""
echo "📝 The backend should now accept authenticated requests from the approuter!" 