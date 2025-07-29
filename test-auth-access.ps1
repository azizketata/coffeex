# Test Authentication Access Patterns
Write-Host "🔐 Testing Authentication Access Patterns" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

$backend = "https://technische-universit-t-m-nchen-sap-hochschulkompetenzze3525cbaf.cfapps.us10-001.hana.ondemand.com"
$approuter = "https://technische-universit-t-m-nchen-sap-hochschulkompetenzzenea81862.cfapps.us10-001.hana.ondemand.com"

Write-Host "`n❌ Direct Backend Access (Expected to Fail with 401):" -ForegroundColor Yellow
Write-Host "This is NORMAL - backend requires authentication tokens"
Write-Host "URL: $backend/odata/v4/Users"

Write-Host "`n✅ Access Through Approuter (Should Work):" -ForegroundColor Green
Write-Host "The approuter handles authentication and forwards tokens"
Write-Host "URL: $approuter/odata/v4/Users"

# Open both URLs
Write-Host "`nOpening both URLs for comparison..."
Start-Process "$backend/odata/v4/Users"
Start-Sleep -Seconds 2
Start-Process "$approuter/odata/v4/Users"

Write-Host "`n📋 What You Should See:" -ForegroundColor Cyan
Write-Host "1. Direct backend: 401 Unauthorized error (this is correct!)"
Write-Host "2. Approuter: Login page → After login → User data"

Write-Host "`n🎯 Why This Happens:" -ForegroundColor Yellow
Write-Host "- Backend expects JWT tokens from XSUAA"
Write-Host "- Direct access has no tokens = 401 error"
Write-Host "- Approuter handles login and adds tokens to requests"
Write-Host "- Frontend should ALWAYS go through approuter"

Write-Host "`n💡 Solution:" -ForegroundColor Green
Write-Host "Always access your app through the approuter URL:"
Write-Host $approuter -ForegroundColor Cyan 