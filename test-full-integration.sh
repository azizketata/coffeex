#!/bin/bash

echo "🧪 Testing Full Frontend-Backend Integration"
echo "==========================================="

# Update frontend
echo ""
echo "📦 Updating approuter with fixed frontend..."
cf push coffeex-approuter \
  -p approuter \
  -m 256M \
  -b nodejs_buildpack

# Check app status
echo ""
echo "📊 Checking app status..."
cf apps | grep coffeex

# Test backend health
echo ""
echo "🏥 Testing backend health..."
BACKEND_URL="https://technische-universit-t-m-nchen-sap-hochschulkompetenzze3525cbaf.cfapps.us10-001.hana.ondemand.com"
echo "Backend health check: $BACKEND_URL/health"

# Test approuter
echo ""
echo "🌐 Approuter URL:"
APPROUTER_URL="https://technische-universit-t-m-nchen-sap-hochschulkompetenzzenea81862.cfapps.us10-001.hana.ondemand.com"
echo $APPROUTER_URL

echo ""
echo "✅ Integration test checklist:"
echo "1. Open: $APPROUTER_URL"
echo "2. Login with your SAP credentials (e.g., ge34ram@mytum.de)"
echo "3. You should see:"
echo "   - Coffee app loads successfully"
echo "   - Your real name appears (not 'Lisa')"
echo "   - Balance is displayed"
echo "   - No console errors about 'user not logged in'"
echo ""
echo "4. Test backend data access:"
echo "   - Go to: $APPROUTER_URL/odata/v4/Users"
echo "   - Should see user data (after login)"
echo ""
echo "📝 Troubleshooting:"
echo "- Clear browser cookies if redirect loop"
echo "- Check F12 console for errors"
echo "- Run: cf logs coffeex-srv --recent"
echo "- Run: cf logs coffeex-approuter --recent" 