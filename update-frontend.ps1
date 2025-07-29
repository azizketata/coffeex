# Quick Frontend Update Script
Write-Host "🚀 Updating Frontend with Fixed UserService" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Copy debug files to production
Write-Host "`n📝 Copying debug files to production..." -ForegroundColor Yellow
Copy-Item approuter/resources/Component-dbg.js -Destination approuter/resources/Component.js -Force
Copy-Item approuter/resources/controller/Home-dbg.controller.js -Destination approuter/resources/controller/Home.controller.js -Force

Write-Host "✅ Files copied" -ForegroundColor Green

# Create deployment script for Linux
$bashScript = @'
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
'@

$bashScript | Out-File -FilePath "update-frontend.sh" -Encoding UTF8

Write-Host "`n✅ Created update-frontend.sh" -ForegroundColor Green
Write-Host "`n📋 Instructions:" -ForegroundColor Cyan
Write-Host "1. Login to BTP terminal" 
Write-Host "2. Run: chmod +x update-frontend.sh"
Write-Host "3. Run: ./update-frontend.sh"
Write-Host "`nThis will update just the approuter with the fixed UserService" -ForegroundColor Yellow 