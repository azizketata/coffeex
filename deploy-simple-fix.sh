#!/bin/bash

# Simple CoffeeX Deployment Fix
echo -e "\033[32m🔧 CoffeeX Simple Deployment\033[0m"
echo -e "\033[32m===========================\033[0m"

# Build the project
echo -e "\n\033[33mStep 1: Building the project...\033[0m"
npm run build

if [ $? -ne 0 ]; then
    echo -e "\033[31mBuild failed!\033[0m"
    exit 1
fi

# Deploy backend service
echo -e "\n\033[33mStep 2: Deploying backend service...\033[0m"
cf push coffeex-srv \
  -p gen/srv \
  -m 512M \
  -k 1G \
  -b nodejs_buildpack \
  --no-start

# Bind XSUAA to backend
echo -e "\n\033[33mStep 3: Binding services to backend...\033[0m"
cf bind-service coffeex-srv coffeex
cf start coffeex-srv

# Get backend URL
BACKEND_URL=$(cf app coffeex-srv | grep routes | awk '{print $2}')
echo -e "\033[32mBackend URL: https://${BACKEND_URL}\033[0m"

# Deploy approuter
echo -e "\n\033[33mStep 4: Deploying approuter...\033[0m"
cf push coffeex-simple-approuter \
  -p simple-approuter \
  -m 128M \
  -k 256M \
  -b nodejs_buildpack \
  --no-start

# Set destinations environment variable
echo -e "\n\033[33mStep 5: Configuring approuter...\033[0m"
cf set-env coffeex-simple-approuter destinations '[{"name":"coffeex-srv","url":"https://'${BACKEND_URL}'","forwardAuthToken":true}]'

# Bind XSUAA to approuter
echo -e "\n\033[33mStep 6: Binding XSUAA to approuter...\033[0m"
cf bind-service coffeex-simple-approuter coffeex

# Start approuter
echo -e "\n\033[33mStep 7: Starting approuter...\033[0m"
cf start coffeex-simple-approuter

echo -e "\n\033[32m✅ Deployment completed!\033[0m"

# Get approuter URL
APPROUTER_URL=$(cf app coffeex-simple-approuter | grep routes | awk '{print $2}')

echo -e "\n\033[36m📋 Test your app:\033[0m"
echo -e "\033[36m================\033[0m"
echo ""
echo "1. Open your browser to:"
echo -e "   \033[37mhttps://${APPROUTER_URL}\033[0m"
echo ""
echo "2. You'll be redirected to SAP login automatically"
echo ""
echo "3. After login, you'll see: 'Welcome, [Your Name]!'"
echo ""
echo -e "\033[33m📊 If there are issues, check logs:\033[0m"
echo -e "   cf logs coffeex-srv --recent"
echo -e "   cf logs coffeex-simple-approuter --recent" 