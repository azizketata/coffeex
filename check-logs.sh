#!/bin/bash
# Check app logs to see why it's not starting

echo "🔍 Checking CoffeeX Startup Issues"
echo "=================================="

# Stop the app first
echo "⏹️ Stopping app to check logs..."
cf stop coffeex-srv

# Get recent logs
echo -e "\n📜 Recent logs:"
cf logs coffeex-srv --recent | tail -50

# Check app events
echo -e "\n📊 App events:"
cf events coffeex-srv

# SSH into the app to check configuration
echo -e "\n🔧 Checking app configuration:"
cf ssh coffeex-srv -c "cat package.json" || echo "Cannot SSH - app not running"
cf ssh coffeex-srv -c "ls -la" || echo "Cannot SSH - app not running"

# Check environment
echo -e "\n⚙️ Environment variables:"
cf env coffeex-srv | grep -E "CDS_ENV|NODE_ENV|cds_requires_db_kind"

# Get crash logs
echo -e "\n💥 Crash logs:"
cf logs coffeex-srv --recent | grep -E "ERR|Error|FAIL|crash" 