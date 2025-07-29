#!/bin/bash

echo "🚀 Deploying Fixed Frontend"
echo "========================="

# Stop approuter
echo ""
echo "🛑 Stopping approuter..."
cf stop coffeex-approuter

# Push updated approuter
echo ""
echo "📦 Pushing updated approuter..."
cf push coffeex-approuter \
  -p approuter \
  -m 256M \
  -b nodejs_buildpack

# Check status
echo ""
echo "✅ Frontend updated!"
cf app coffeex-approuter 