#!/bin/bash

# Test Authentication Flow for CoffeeX
echo "🧪 Testing CoffeeX Authentication Flow"
echo "======================================"

# Get URLs
APPROUTER_URL="https://technische-universit-t-m-nchen-sap-hochschulkompetenzzenea81862.cfapps.us10-001.hana.ondemand.com"
BACKEND_URL="https://technische-universit-t-m-nchen-sap-hochschulkompetenzze3525cbaf.cfapps.us10-001.hana.ondemand.com"

echo ""
echo "📍 URLs:"
echo "  Approuter: $APPROUTER_URL"
echo "  Backend: $BACKEND_URL"

# Test 1: Direct backend access (should fail)
echo ""
echo "1️⃣ Testing direct backend access (should require auth):"
echo "curl -s -o /dev/null -w '%{http_code}' $BACKEND_URL/odata/v4/"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/odata/v4/")
if [ "$HTTP_CODE" = "401" ]; then
    echo "✅ Direct backend access blocked (401) - Good!"
else
    echo "⚠️ Backend returned $HTTP_CODE - Expected 401"
fi

# Test 2: Backend health check (should work)
echo ""
echo "2️⃣ Testing backend health endpoint:"
echo "curl -s $BACKEND_URL/health | jq ."
curl -s "$BACKEND_URL/health" | jq . || echo "Health check failed"

# Test 3: Approuter redirect
echo ""
echo "3️⃣ Testing approuter (should redirect to login):"
echo "curl -s -o /dev/null -w '%{http_code} %{redirect_url}' $APPROUTER_URL/"
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "$APPROUTER_URL/"

# Test 4: Check approuter logs for errors
echo ""
echo "4️⃣ Checking approuter logs for destination errors:"
cf logs coffeex-approuter --recent | grep -E "destination|error|Error" | tail -10

# Test 5: Check backend logs for auth errors
echo ""
echo "5️⃣ Checking backend logs for authentication:"
cf logs coffeex-srv --recent | grep -E "auth|Auth|xsuaa|XSUAA" | tail -10

# Browser test instructions
echo ""
echo "📱 Manual Browser Test:"
echo "======================================"
echo "1. Open: $APPROUTER_URL"
echo "2. You should be redirected to SAP login"
echo "3. Login with your SAP BTP credentials"
echo "4. After login, you should see the Coffee Frontend"
echo ""
echo "5. Test backend integration:"
echo "   - Click on profile/balance - should show user data"
echo "   - Try TopUp function - should work without 'user not logged in' error"
echo "   - Check browser console for any 401/403 errors"
echo ""
echo "6. Advanced test - Check auth token:"
echo "   - Open browser DevTools (F12)"
echo "   - Go to Network tab"
echo "   - Make any action (like TopUp)"
echo "   - Check request headers for 'Authorization: Bearer' token"
echo ""

# Test 6: Service bindings check
echo "🔍 Service Bindings Check:"
echo "======================================"
echo "Backend XSUAA binding:"
cf env coffeex-srv | grep -A5 "xsuaa" | head -20

echo ""
echo "✅ If all tests pass, authentication is working correctly!"
echo "❌ If you still get 'user not logged in', check:"
echo "   1. Clear browser cache/cookies"
echo "   2. Use incognito/private mode"
echo "   3. Check if roles are assigned in BTP cockpit" 