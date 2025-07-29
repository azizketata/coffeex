#!/bin/bash

# Redeploy Approuter with Authentication Fixes
echo "🔄 Redeploying CoffeeX Approuter"
echo "================================"

# Stop the approuter
echo ""
echo "⏹️ Stopping approuter..."
cf stop coffeex-approuter

# Push the updated approuter
echo ""
echo "📤 Pushing updated approuter..."
cf push coffeex-approuter \
  -p approuter \
  -m 256M \
  -b nodejs_buildpack \
  --no-start

# Start the approuter
echo ""
echo "▶️ Starting approuter..."
cf start coffeex-approuter

# Check status
echo ""
echo "📊 Checking approuter status..."
cf app coffeex-approuter

echo ""
echo "✅ Approuter redeployed!"
echo ""
echo "🧪 Test the authentication:"
echo "1. Open: https://technische-universit-t-m-nchen-sap-hochschulkompetenzzenea81862.cfapps.us10-001.hana.ondemand.com/"
echo "2. You should be redirected to login"
echo "3. After login, you should see your actual name (not 'Lisa')"
echo "4. Check browser console for any errors"
echo ""
echo "📝 The approuter will now:"
echo "- Get real user data from XSUAA"
echo "- Display your actual name instead of 'Lisa'"
echo "- Store user data properly for backend calls" 