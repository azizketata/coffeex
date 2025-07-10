#!/bin/bash
# Inspect current deployment state

echo "🔍 Inspecting CoffeeX Deployment"
echo "================================"

# Check app status
echo -e "\n📊 App Status:"
cf app coffeex-srv

# Check environment variables
echo -e "\n⚙️ Environment Variables:"
cf env coffeex-srv | grep -E "CDS_ENV|NODE_ENV|VCAP_SERVICES" | head -20

# Check service bindings
echo -e "\n🔗 Service Bindings:"
cf services

# SSH into the app to check files
echo -e "\n📁 Checking app files:"
cf ssh coffeex-srv -c "ls -la"
cf ssh coffeex-srv -c "ls -la srv/"
cf ssh coffeex-srv -c "cat .cdsrc.json 2>/dev/null || echo 'No .cdsrc.json found'"
cf ssh coffeex-srv -c "cat srv/.cdsrc.json 2>/dev/null || echo 'No srv/.cdsrc.json found'"

# Check VCAP_SERVICES
echo -e "\n🔐 Checking VCAP_SERVICES for HANA:"
cf ssh coffeex-srv -c "echo \$VCAP_SERVICES | jq '.hana' 2>/dev/null || echo 'No HANA service found'" 