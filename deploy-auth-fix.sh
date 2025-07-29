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

# Deploy approuter
echo -e "\n\033[33mStep 3: Deploying approuter (coffeex-simple-approuter)...\033[0m"
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
echo -e "\n\033[33mStep 4: Checking app status...\033[0m"
cf apps | grep -E "(coffeex-srv|coffeex-simple-approuter)"

# Instructions for testing
echo -e "\n\033[36m📋 Testing the Authentication Fix:\033[0m"
echo -e "\033[36m==================================\033[0m"
echo ""
echo "1. Navigate to your app:"
echo -e "   \033[37mhttps://coffeex-simple-approuter.cfapps.us10-001.hana.ondemand.com/\033[0m"
echo ""
echo "2. Click 'Login with SAP ID'"
echo ""
echo "3. Complete SAP authentication"
echo ""
echo "4. ✅ You should be redirected back to the app (not to /backend/odata/v4)"
echo ""
echo -e "\033[33m📊 Monitor logs for debugging:\033[0m"
echo -e "   \033[37mcf logs coffeex-srv --recent\033[0m"
echo -e "   \033[37mcf logs coffeex-simple-approuter --recent\033[0m"
echo ""
echo -e "\033[32mThe enhanced logging will show:\033[0m"
echo "   ✓ All HTTP requests with timestamps"
echo "   ✓ Authentication state and user details"
echo "   ✓ Full error stack traces if any issues occur" 