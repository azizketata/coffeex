#!/bin/bash

# Manual database deployment script

echo "🔧 Manual Database Deployment"
echo "============================"

# Check current state
echo "📊 Checking database deployer state..."
cf app coffeex-db-deployer

# SSH into the deployer and run npm start manually
echo ""
echo "🚀 Running deployment manually via SSH..."
cf ssh coffeex-db-deployer -c "cd /home/vcap/app && npm start"

# If that fails, try with more details
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Direct run failed. Trying with debug mode..."
    cf ssh coffeex-db-deployer -c "cd /home/vcap/app && DEBUG=* npm start"
fi

# Restart the main app
echo ""
echo "🔄 Restarting main app..."
cf restart coffeex-srv

echo ""
echo "✅ Check app status:"
curl -s https://technische-universit-t-m-nchen-sap-hochschulkompetenzze3525cbaf.cfapps.us10-001.hana.ondemand.com/health | jq . 