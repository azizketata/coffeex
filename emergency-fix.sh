#!/bin/bash
# Emergency fix for startup issues

echo "🚨 Emergency Fix for CoffeeX"
echo "============================"

# Stop the app
echo "⏹️ Stopping app..."
cf stop coffeex-srv

# Check logs first
echo -e "\n📜 Checking recent errors..."
cf logs coffeex-srv --recent | grep -A5 -B5 "Error" | tail -20

# Create a proper start script in gen/srv
echo -e "\n📝 Creating proper startup configuration..."
cd gen/srv

# Create a production-ready .cdsrc.json
cat > .cdsrc.json << 'EOF'
{
  "requires": {
    "db": {
      "kind": "hana-cloud"
    },
    "auth": {
      "kind": "mocked"
    },
    "messaging": {
      "kind": "file-based-messaging"
    }
  }
}
EOF

# Update package.json to add @sap/hana-client
echo -e "\n📦 Updating dependencies..."
cp package.json package.json.bak
cat package.json.bak | jq '.dependencies["@sap/hana-client"] = "^2"' > package.json

# Create start script that ensures production mode
cat > start.sh << 'EOF'
#!/bin/bash
export CDS_ENV=production
export NODE_ENV=production
# Force HANA usage
export cds_requires_db='{"kind":"hana-cloud"}'
node node_modules/@sap/cds/bin/serve.js
EOF
chmod +x start.sh

# Update package.json to use start.sh
cat package.json | jq '.scripts.start = "./start.sh"' > package.json.tmp
mv package.json.tmp package.json

# Go back to root
cd ../..

# Redeploy
echo -e "\n🚀 Redeploying with fixes..."
cf push coffeex-srv -p gen/srv -b nodejs_buildpack -m 512M

# Monitor startup
echo -e "\n👀 Monitoring startup..."
cf logs coffeex-srv 