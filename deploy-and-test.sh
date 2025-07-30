#!/bin/bash

# Deploy and Test Script for CoffeeX Authentication Fix
echo -e "\033[32mCoffeeX Authentication Fix Deployment Script\033[0m"
echo -e "\033[32m============================================\033[0m"

# Build the project
echo -e "\n\033[33mStep 1: Building the project...\033[0m"
npm run build

if [ $? -ne 0 ]; then
    echo -e "\033[31mBuild failed! Please check the errors above.\033[0m"
    exit 1
fi

# Build MTA
echo -e "\n\033[33mStep 2: Building MTA archive...\033[0m"
mbt build -t ./

if [ $? -ne 0 ]; then
    echo -e "\033[31mMTA build failed! Make sure you have mbt installed:\033[0m"
    echo -e "\033[33mnpm install -g mbt\033[0m"
    exit 1
fi

# Deploy to BTP
echo -e "\n\033[33mStep 3: Deploying to BTP...\033[0m"
# Find the latest mtar file
MTAR_FILE=$(ls -t *.mtar 2>/dev/null | head -1)
if [ -z "$MTAR_FILE" ]; then
    echo -e "\033[31mNo mtar file found!\033[0m"
    exit 1
fi
echo "Deploying $MTAR_FILE..."
cf deploy "$MTAR_FILE"

if [ $? -ne 0 ]; then
    echo -e "\033[31mDeployment failed! Please check the errors above.\033[0m"
    exit 1
fi

echo -e "\n\033[32m✅ Deployment completed successfully!\033[0m"

# Get app status
echo -e "\n\033[33mStep 4: Checking app status...\033[0m"
cf apps

# Instructions for testing
echo -e "\n\033[36m📋 Testing Instructions:\033[0m"
echo -e "\033[36m========================\033[0m"
echo "1. Open your browser and navigate to:"
echo -e "   \033[37mhttps://coffeex-simple-approuter.cfapps.us10-001.hana.ondemand.com/\033[0m"
echo ""
echo "2. Click on 'Login with SAP ID' button"
echo ""
echo "3. You should be redirected to SAP login page"
echo ""
echo "4. After successful login, you should be redirected back to the app"
echo "   (NOT to /backend/odata/v4)"
echo ""
echo "5. The app should show the welcome screen with your user info"
echo ""
echo -e "\033[33m⚠️  If you still get an error, check the logs:\033[0m"
echo -e "   \033[37mcf logs coffeex-srv --recent\033[0m"
echo -e "   \033[37mcf logs coffeex-simple-approuter --recent\033[0m"
echo ""
echo -e "\033[33m📊 The enhanced logging will show:\033[0m"
echo "   - All incoming requests with timestamps"
echo "   - Authentication state and user details"
echo "   - Any errors with full stack traces" 