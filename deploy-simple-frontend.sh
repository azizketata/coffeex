#!/bin/bash

echo "🚀 Deploying Simple CoffeeX Frontend"
echo "===================================="

# Install dependencies for approuter
echo ""
echo "📦 Installing approuter dependencies..."
cd simple-approuter
npm install
cd ..

# Deploy the approuter
echo ""
echo "🚀 Deploying simple approuter..."
cf push coffeex-simple-approuter \
  -p simple-approuter \
  -m 128M \
  -b nodejs_buildpack

# Check status
echo ""
echo "✅ Deployment complete!"
cf app coffeex-simple-approuter

echo ""
echo "🌐 Access your app at:"
cf app coffeex-simple-approuter | grep routes | awk '{print "https://" $2}'

echo ""
echo "📋 What you'll see:"
echo "1. Automatic redirect to SAP login"
echo "2. After login: Welcome page with your name"
echo "3. Simple, clean UI with logout button" 