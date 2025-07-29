#!/bin/bash

echo "🔍 Checking CoffeeX Database Content"
echo "===================================="

# Check if HDI container is deployed
echo ""
echo "📋 Checking HDI container status..."
cf services | grep coffeex-hana

# Check database deployer logs
echo ""
echo "📃 Checking database deployer logs..."
cf logs coffeex-db-deployer --recent | tail -20

# Try to run database deployer manually
echo ""
echo "🚀 Attempting to deploy database schema..."
cf run-task coffeex-db-deployer --command "npm start" --name "deploy-db-manual"

# Wait for task to complete
echo ""
echo "⏳ Waiting for deployment task..."
sleep 10

# Check task status
echo ""
echo "📊 Task status:"
cf tasks coffeex-db-deployer

echo ""
echo "💡 To check data manually:"
echo "1. cf ssh coffeex-srv"
echo "2. npm run console"
echo "3. Run these queries:"
echo "   SELECT * FROM COFFEEX_USER;"
echo "   SELECT * FROM COFFEEX_MACHINE;"
echo "   SELECT * FROM COFFEEX_COFFEETX;"
echo ""
echo "📝 Note: If no data exists, the HDI container may not be deployed."
echo "Contact Nathalie to ensure HDI container service is created." 