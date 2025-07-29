#!/bin/bash

# Fix Destination Configuration for CoffeeX
echo "🔧 Fixing CoffeeX Destination Configuration"
echo "=========================================="

# First, let's check the service key (without the trailing ~)
echo ""
echo "📋 Checking destination service key..."
cf service-key coffeex-srv-api coffeex-srv-api-key~ || {
    echo "❌ Key retrieval failed, let's list all keys"
    cf service-keys coffeex-srv-api
}

# Create a proper service key if needed
echo ""
echo "🔑 Creating proper service key..."
cf create-service-key coffeex-srv-api coffeex-srv-api-key
cf service-key coffeex-srv-api coffeex-srv-api-key

# Get the backend URL
BACKEND_URL="https://technische-universit-t-m-nchen-sap-hochschulkompetenzze3525cbaf.cfapps.us10-001.hana.ondemand.com"
echo ""
echo "🌐 Backend URL: $BACKEND_URL"

# Create destination configuration
echo ""
echo "📝 Creating destination configuration JSON..."
cat > destination-config.json << EOF
{
  "init_data": {
    "subaccount": {
      "destinations": [
        {
          "Name": "coffeex-srv-api",
          "Type": "HTTP",
          "URL": "$BACKEND_URL",
          "Authentication": "NoAuthentication",
          "ProxyType": "Internet",
          "forwardAuthToken": true,
          "HTML5.ForwardAuthToken": true,
          "WebIDEEnabled": true,
          "WebIDEUsage": "odata_gen",
          "Description": "CoffeeX Backend Service"
        }
      ]
    }
  }
}
EOF

echo ""
echo "🚀 Option 1: Update service with destination configuration"
echo "This will add the destination to the existing service:"
echo ""
echo "cf update-service coffeex-srv-api -c destination-config.json"
echo ""
echo "Press Enter to execute this command..."
read
cf update-service coffeex-srv-api -c destination-config.json

# Wait for update to complete
echo ""
echo "⏳ Waiting for service update to complete..."
sleep 10

# Bind the correct destination service to approuter
echo ""
echo "🔗 Binding coffeex-srv-api to approuter..."
cf bind-service coffeex-approuter coffeex-srv-api

# Unbind the old destination service
echo ""
echo "🔓 Unbinding old destination service..."
cf unbind-service coffeex-approuter coffeex-Destination

# Restart the approuter
echo ""
echo "🔄 Restarting approuter..."
cf restart coffeex-approuter

echo ""
echo "✅ Destination configuration complete!"
echo ""
echo "📍 Test URLs:"
echo "  - Approuter: https://technische-universit-t-m-nchen-sap-hochschulkompetenzzenea81862.cfapps.us10-001.hana.ondemand.com/"
echo "  - Backend: $BACKEND_URL/health"
echo ""
echo "🧪 Test the approuter routing:"
echo "curl https://technische-universit-t-m-nchen-sap-hochschulkompetenzzenea81862.cfapps.us10-001.hana.ondemand.com/odata/v4/"

# Clean up
rm destination-config.json 