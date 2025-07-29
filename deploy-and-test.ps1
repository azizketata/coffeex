# Deploy and Test Script for CoffeeX Authentication Fix
Write-Host "CoffeeX Authentication Fix Deployment Script" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

# Build the project
Write-Host "`nStep 1: Building the project..." -ForegroundColor Yellow
npm run build:cf

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Please check the errors above." -ForegroundColor Red
    exit 1
}

# Deploy to BTP
Write-Host "`nStep 2: Deploying to BTP..." -ForegroundColor Yellow
cf deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed! Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Deployment completed successfully!" -ForegroundColor Green

# Get app status
Write-Host "`nStep 3: Checking app status..." -ForegroundColor Yellow
cf apps

# Instructions for testing
Write-Host "`n📋 Testing Instructions:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "1. Open your browser and navigate to:"
Write-Host "   https://coffeex-simple-approuter.cfapps.us10-001.hana.ondemand.com/" -ForegroundColor White
Write-Host ""
Write-Host "2. Click on 'Login with SAP ID' button"
Write-Host ""
Write-Host "3. You should be redirected to SAP login page"
Write-Host ""
Write-Host "4. After successful login, you should be redirected back to the app"
Write-Host "   (NOT to /backend/odata/v4)"
Write-Host ""
Write-Host "5. The app should show the welcome screen with your user info"
Write-Host ""
Write-Host "⚠️  If you still get an error, check the logs:" -ForegroundColor Yellow
Write-Host "   cf logs coffeex-srv --recent" -ForegroundColor White
Write-Host ""
Write-Host "📊 The enhanced logging will show:" -ForegroundColor Yellow
Write-Host "   - All incoming requests with timestamps"
Write-Host "   - Authentication state and user details"
Write-Host "   - Any errors with full stack traces" 