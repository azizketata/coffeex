#!/bin/bash

echo "🚀 CoffeeX Temporary Deployment Script"
echo "This script deploys CoffeeX with only HANA and Alerts services"
echo "================================================"

# Check if logged in
if ! cf target > /dev/null 2>&1; then
    echo "❌ Not logged in to Cloud Foundry"
    echo "Please run: cf login --sso"
    exit 1
fi

echo "✅ Current CF Target:"
cf target

# Build the application
echo -e "\n📦 Building application..."
npm install
npm run build

# Build MTA with temporary configuration
echo -e "\n🔨 Building MTA archive with temporary configuration..."
mbt build -t ./ --mtar coffeex-temp.mtar --config mta-temp.yaml

# Check if build was successful
if [ ! -f "coffeex-temp.mtar" ]; then
    echo "❌ MTA build failed"
    exit 1
fi

# Deploy to Cloud Foundry
echo -e "\n☁️  Deploying to Cloud Foundry..."
cf deploy coffeex-temp.mtar

# Check deployment status
echo -e "\n📊 Checking deployment status..."
cf apps
cf services

# Get app URL
APP_URL=$(cf app coffeex-srv | grep routes | awk '{print $2}')
echo -e "\n✅ Deployment complete!"
echo "App URL: https://${APP_URL}"
echo -e "\n📝 Next steps:"
echo "1. Test health endpoint: curl https://${APP_URL}/health"
echo "2. Test OData metadata: curl https://${APP_URL}/odata/v4/\$metadata"
echo "3. View logs: cf logs coffeex-srv --recent" 