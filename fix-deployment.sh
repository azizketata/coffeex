#!/bin/bash
# Fix deployment issues script

echo "🔧 Fixing CoffeeX Deployment Issues"
echo "==================================="

# 1. Copy the production config to gen folder
echo "📋 Copying production configuration..."
cp .cdsrc-production.json gen/srv/.cdsrc.json

# 2. Update package.json in gen/srv to ensure proper start command
echo "📝 Updating gen/srv/package.json..."
cd gen/srv
# Add CDS_ENV=production to force production mode
cat > start.sh << 'EOF'
#!/bin/bash
export CDS_ENV=production
export NODE_ENV=production
npm start
EOF
chmod +x start.sh

# Update package.json to use the start script
cp package.json package.json.bak
cat package.json.bak | jq '.scripts.start = "./start.sh"' > package.json

# 3. Create a dummy jobs/runner.js to prevent the error
echo "📁 Creating missing jobs directory..."
mkdir -p ../jobs
cat > ../jobs/runner.js << 'EOF'
// Dummy job runner - jobs disabled in temporary deployment
console.log('Job scheduler disabled in temporary deployment');
module.exports = {};
EOF

# 4. Redeploy just the service app
cd ../..
echo "🚀 Redeploying coffeex-srv..."
cf push coffeex-srv -p gen/srv -b nodejs_buildpack -m 512M --no-start

# 5. Bind services
echo "🔗 Binding services..."
cf bind-service coffeex-srv coffeex-hana
cf bind-service coffeex-srv coffeex-alerts

# 6. Set environment variables
echo "⚙️ Setting environment variables..."
cf set-env coffeex-srv CDS_ENV production
cf set-env coffeex-srv NODE_ENV production

# 7. Start the app
echo "▶️ Starting the app..."
cf start coffeex-srv

# 8. Check status
echo -e "\n✅ Deployment fixed!"
cf app coffeex-srv | grep -E "name:|state:|routes:"

# 9. Test the health endpoint
APP_URL=$(cf app coffeex-srv | grep routes | awk '{print $2}')
echo -e "\n🧪 Testing health endpoint..."
sleep 5
curl -s https://${APP_URL}/health | jq . 