#!/bin/bash

# Deploy User Authentication Fix
echo "🔐 Deploying User Authentication Fix"
echo "===================================="

# Copy updated files
echo ""
echo "📝 Preparing files..."
cp approuter/resources/Component-dbg.js approuter/resources/Component.js
cp approuter/resources/controller/Home-dbg.controller.js approuter/resources/controller/Home.controller.js

# Build the backend
echo ""
echo "🔨 Building backend..."
npm run build

# Deploy backend first
echo ""
echo "🚀 Deploying backend with getCurrentUser endpoint..."
cf push coffeex-srv \
  -p gen/srv \
  -m 512M \
  -b nodejs_buildpack

# Wait for backend to be ready
echo ""
echo "⏳ Waiting for backend to start..."
sleep 10

# Deploy approuter
echo ""
echo "🚀 Deploying approuter with updated user service..."
cf push coffeex-approuter \
  -p approuter \
  -m 256M \
  -b nodejs_buildpack

# Check status
echo ""
echo "📊 Checking deployment status..."
cf apps | grep coffeex

echo ""
echo "✅ User authentication fix deployed!"
echo ""
echo "🎯 What's New:"
echo "1. Backend endpoint: /odata/v4/getCurrentUser"
echo "2. Returns real authenticated user data"
echo "3. Frontend shows actual user name instead of 'Lisa'"
echo "4. No more mock users!"
echo ""
echo "🧪 Test it:"
echo "1. Open: https://technische-universit-t-m-nchen-sap-hochschulkompetenzzenea81862.cfapps.us10-001.hana.ondemand.com/"
echo "2. Login with your SAP credentials"
echo "3. You should see 'Good Morning, [Your Name]'"
echo "4. Check console - no more authentication errors!" 