#!/bin/bash

echo "🔍 Diagnosing Authentication Issues"
echo "==================================="

# Check XSUAA service binding
echo ""
echo "📋 Checking XSUAA service binding..."
cf services | grep -E "coffeex|xsuaa"

# Check environment variables
echo ""
echo "🔧 Checking authentication environment variables..."
cf env coffeex-srv | grep -E "VCAP_SERVICES|xsuaa|auth" | head -20

# Check if app is bound to XSUAA
echo ""
echo "🔗 Checking service bindings for coffeex-srv..."
cf service coffeex || echo "⚠️ XSUAA service 'coffeex' not found"

# Check backend logs for auth errors
echo ""
echo "📃 Recent authentication-related logs..."
cf logs coffeex-srv --recent | grep -E "auth|401|user|xsuaa" | tail -20

# Check current configuration
echo ""
echo "📂 Checking deployed configuration..."
cf ssh coffeex-srv -c "cat gen/srv/.cdsrc.json 2>/dev/null || cat .cdsrc-production.json 2>/dev/null || echo 'No config found'"

echo ""
echo "💡 Diagnosis:"
echo "1. If XSUAA service is not bound, run: cf bind-service coffeex-srv coffeex"
echo "2. If auth kind is not 'xsuaa', redeploy with correct config"
echo "3. If no service binding exists, the backend can't validate tokens"

echo ""
echo "🔧 Quick Fix Commands:"
echo "cf bind-service coffeex-srv coffeex"
echo "cf restage coffeex-srv" 