Write-Host "🚀 CoffeeX Temporary Deployment Script" -ForegroundColor Green
Write-Host "This script deploys CoffeeX with only HANA and Alerts services" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow

# Check if logged in
$cfTarget = cf target 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Cloud Foundry" -ForegroundColor Red
    Write-Host "Please run: cf login --sso" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Current CF Target:" -ForegroundColor Green
cf target

# Build the application
Write-Host "`n📦 Building application..." -ForegroundColor Cyan
npm install
npm run build

# Build MTA with temporary configuration  
Write-Host "`n🔨 Building MTA archive with temporary configuration..." -ForegroundColor Cyan
mbt build -t ./ --mtar coffeex-temp.mtar --config mta-temp.yaml

# Check if build was successful
if (-not (Test-Path "coffeex-temp.mtar")) {
    Write-Host "❌ MTA build failed" -ForegroundColor Red
    exit 1
}

# Deploy to Cloud Foundry
Write-Host "`n☁️  Deploying to Cloud Foundry..." -ForegroundColor Cyan
cf deploy coffeex-temp.mtar

# Check deployment status
Write-Host "`n📊 Checking deployment status..." -ForegroundColor Cyan
cf apps
cf services

# Get app URL
$appInfo = cf app coffeex-srv 2>$null
$appUrl = ($appInfo | Select-String "routes:").ToString().Split()[1]

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "App URL: https://$appUrl" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Test health endpoint: curl https://$appUrl/health" -ForegroundColor White
Write-Host "2. Test OData metadata: curl https://$appUrl/odata/v4/`$metadata" -ForegroundColor White
Write-Host "3. View logs: cf logs coffeex-srv --recent" -ForegroundColor White 