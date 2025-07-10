#!/bin/bash
# Quick fix - just update environment variables

echo "🚀 Quick Fix for CoffeeX"
echo "========================"

# Stop the app
echo "⏹️ Stopping app..."
cf stop coffeex-srv

# Set correct environment variables
echo "⚙️ Setting environment variables..."
cf set-env coffeex-srv CDS_ENV production
cf set-env coffeex-srv NODE_ENV production
cf set-env coffeex-srv cds_requires_db_kind hana-cloud

# Restart
echo "🔄 Restarting app..."
cf restart coffeex-srv

# Check logs
echo -e "\n📜 Recent logs:"
cf logs coffeex-srv --recent | tail -30

# Test
APP_URL=$(cf app coffeex-srv | grep routes | awk '{print $2}')
echo -e "\n🧪 Testing:"
echo "URL: https://${APP_URL}"
curl -s https://${APP_URL}/health 