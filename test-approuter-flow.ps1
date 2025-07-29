# Test Complete Authentication Flow
Write-Host "🔐 Testing Complete Authentication Flow" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

$approuter = "https://technische-universit-t-m-nchen-sap-hochschulkompetenzzenea81862.cfapps.us10-001.hana.ondemand.com"

Write-Host "`n📋 Test Steps:" -ForegroundColor Yellow
Write-Host "1. Opening approuter URL..."
Write-Host "2. You'll be redirected to SAP login"
Write-Host "3. Login with your credentials"
Write-Host "4. Check if you see the coffee app"
Write-Host "5. Check browser console for errors"

Write-Host "`n🌐 Opening approuter..." -ForegroundColor Green
Start-Process $approuter

Write-Host "`n🔍 What to Check:" -ForegroundColor Cyan
Write-Host "- Should see SAP login page"
Write-Host "- After login, should see coffee app"
Write-Host "- Your name should appear (not 'Lisa')"
Write-Host "- Check F12 console for errors"

Write-Host "`n💡 Common Issues:" -ForegroundColor Yellow
Write-Host "- If redirect loop: Clear cookies"
Write-Host "- If 502 error: Backend crashed (check logs)"
Write-Host "- If no data: Database not connected"

Write-Host "`n🔧 Troubleshooting Commands:" -ForegroundColor Green
Write-Host "cf logs coffeex-srv --recent"
Write-Host "cf logs coffeex-approuter --recent"
Write-Host "cf app coffeex-srv" 