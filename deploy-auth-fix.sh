#!/bin/bash

# Deploy Authentication Fix for CoffeeX
echo -e "\033[32m🔧 CoffeeX Authentication Fix Deployment\033[0m"
echo -e "\033[32m========================================\033[0m"

# Build the project first
echo -e "\n\033[33mStep 1: Building the project...\033[0m"
npm run build

if [ $? -ne 0 ]; then
    echo -e "\033[31mBuild failed! Please check the errors above.\033[0m"
    exit 1
fi

# Deploy backend service
echo -e "\n\033[33mStep 2: Deploying backend service (coffeex-srv)...\033[0m"
cf push coffeex-srv \
  -p gen/srv \
  -m 512M \
  -k 1G \
  -b nodejs_buildpack

if [ $? -ne 0 ]; then
    echo -e "\033[31mBackend deployment failed!\033[0m"
    exit 1
fi

# Get backend URL
BACKEND_URL=$(cf app coffeex-srv | grep routes | awk '{print $2}')
echo -e "\033[32mBackend URL: https://${BACKEND_URL}\033[0m"

# Set up destination environment variable for approuter
echo -e "\n\033[33mStep 3: Configuring approuter destinations...\033[0m"
cf set-env coffeex-simple-approuter destinations '[{"name":"coffeex-srv","url":"https://'${BACKEND_URL}'","forwardAuthToken":true}]'

# Deploy approuter
echo -e "\n\033[33mStep 4: Deploying approuter (coffeex-simple-approuter)...\033[0m"
cf push coffeex-simple-approuter \
  -p simple-approuter \
  -m 128M \
  -k 256M \
  -b nodejs_buildpack

if [ $? -ne 0 ]; then
    echo -e "\033[31mApprouter deployment failed!\033[0m"
    exit 1
fi

echo -e "\n\033[32m✅ Deployment completed successfully!\033[0m"

# Get app status
echo -e "\n\033[33mStep 5: Checking app status...\033[0m"
cf apps | grep -E "(coffeex-srv|coffeex-simple-approuter)"

# Instructions for testing
echo -e "\n\033[36m📋 Testing the Authentication Fix:\033[0m"
echo -e "\033[36m==================================\033[0m"
echo ""
echo "1. Navigate to your app:"
echo -e "   \033[37mhttps://coffeex-simple-approuter.cfapps.us10-001.hana.ondemand.com/\033[0m"
echo ""
echo "2. You should be automatically redirected to SAP login"
echo ""
echo "3. Complete SAP authentication"
echo ""
echo "4. ✅ You should see the CoffeeX app with your user info"
echo ""
echo -e "\033[33m📊 Monitor logs for debugging:\033[0m"
echo -e "   \033[37mcf logs coffeex-srv --recent\033[0m"
echo -e "   \033[37mcf logs coffeex-simple-approuter --recent\033[0m"
echo ""
echo -e "\033[32mThe enhanced logging will show:\033[0m"
echo "   ✓ All HTTP requests with timestamps"
echo "   ✓ Authentication state and user details"
echo "   ✓ Full error stack traces if any issues occur" 