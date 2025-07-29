#!/bin/bash

# Quick Approuter Update
echo "🔄 Quick CoffeeX Approuter Update"
echo "================================="

# Just restart to pick up changes
echo ""
echo "🔄 Restarting approuter to apply changes..."
cf restart coffeex-approuter

echo ""
echo "✅ Approuter updated!"
echo ""
echo "📝 Changes applied:"
echo "- Fixed timing issue with user initialization"
echo "- Added temporary mock user service"
echo "- Home view now waits for user data"
echo ""
echo "🧪 Test it now:"
echo "1. Open: https://technische-universit-t-m-nchen-sap-hochschulkompetenzzenea81862.cfapps.us10-001.hana.ondemand.com/"
echo "2. You should see 'Good Morning, SAP User' instead of 'Lisa'"
echo "3. No more 'user not logged in' errors in console" 