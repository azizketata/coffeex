#!/bin/bash

echo "🔧 Fixing Backend Authentication Binding"
echo "======================================="

# Check current service bindings
echo ""
echo "📋 Current service bindings..."
cf services

# Check if XSUAA service exists
echo ""
echo "🔍 Looking for XSUAA service..."
cf service coffeex && echo "✅ XSUAA service found" || echo "❌ XSUAA service not found"

# Bind XSUAA to backend
echo ""
echo "🔗 Binding XSUAA service to backend..."
cf bind-service coffeex-srv coffeex || echo "Already bound or service doesn't exist"

# Check environment
echo ""
echo "🌍 Setting authentication environment..."
cf set-env coffeex-srv cds_requires_auth_kind xsuaa

# Restage to apply changes
echo ""
echo "🔄 Restaging application..."
cf restage coffeex-srv

echo ""
echo "✅ Authentication binding fixed!"
echo ""
echo "🧪 Test URLs:"
echo "1. Direct backend (will still show 401): https://technische-universit-t-m-nchen-sap-hochschulkompetenzze3525cbaf.cfapps.us10-001.hana.ondemand.com/odata/v4/Users"
echo "2. Through approuter (should work): https://technische-universit-t-m-nchen-sap-hochschulkompetenzzenea81862.cfapps.us10-001.hana.ondemand.com/odata/v4/Users"
echo ""
echo "📝 Note: 401 on direct backend access is CORRECT behavior!"
echo "Always access through the approuter for authentication." 