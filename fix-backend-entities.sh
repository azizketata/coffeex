#!/bin/bash

echo "🔧 Fixing Backend Entity References"
echo "==================================="

# Build the app
echo ""
echo "🔨 Building backend..."
npm run build

# Stop backend
echo ""
echo "🛑 Stopping backend..."
cf stop coffeex-srv

# Push updated backend
echo ""
echo "🚀 Pushing fixed backend..."
cf push coffeex-srv \
  -p gen/srv \
  -m 512M \
  -b nodejs_buildpack

# Check logs
echo ""
echo "📃 Checking startup logs..."
cf logs coffeex-srv --recent | tail -20

echo ""
echo "✅ Backend fixed and deployed!"
echo ""
echo "🧪 Test it now:"
echo "1. Open approuter URL: https://technische-universit-t-m-nchen-sap-hochschulkompetenzzenea81862.cfapps.us10-001.hana.ondemand.com/"
echo "2. Login with your SAP credentials"
echo "3. You should see the coffee app with your real name!" 