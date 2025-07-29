# Test Complete CoffeeX Flow
Write-Host "🧪 Testing Complete CoffeeX Integration" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

$approuter = "https://technische-universit-t-m-nchen-sap-hochschulkompetenzzenea81862.cfapps.us10-001.hana.ondemand.com"

Write-Host "`n📋 Test Plan:" -ForegroundColor Yellow
Write-Host "1. Authentication flow"
Write-Host "2. Frontend loads with real user data"
Write-Host "3. Backend data access through approuter"
Write-Host "4. User balance and coffee transactions"

Write-Host "`n🌐 Opening CoffeeX App..." -ForegroundColor Green
Start-Process $approuter

Write-Host "`n✅ What Should Happen:" -ForegroundColor Cyan
Write-Host "1. Redirect to SAP login page"
Write-Host "2. After login: Coffee app loads"
Write-Host "3. Shows 'Good Morning, [Your Name]' (not Lisa!)"
Write-Host "4. Balance displayed correctly"
Write-Host "5. Can tap coffee, see transactions"

Write-Host "`n🔍 Check Browser Console (F12):" -ForegroundColor Yellow
Write-Host "- Look for: 'User initialized: {userId: ..., email: ..., displayName: ...}'"
Write-Host "- Look for: 'User data received from backend'"
Write-Host "- Should NOT see: 'No user logged in'"
Write-Host "- Should NOT see: '401 Unauthorized'"

Write-Host "`n📊 Test Data Access:" -ForegroundColor Green
Write-Host "After login, manually navigate to:"
Write-Host "- $approuter/odata/v4/Users" -ForegroundColor Cyan
Write-Host "- $approuter/odata/v4/Machines" -ForegroundColor Cyan
Write-Host "- $approuter/odata/v4/getCurrentUser()" -ForegroundColor Cyan

Write-Host "`n💡 If Issues Occur:" -ForegroundColor Yellow
Write-Host "1. Clear ALL cookies for the domain"
Write-Host "2. Use incognito/private browsing"
Write-Host "3. Check if backend is running:"
Write-Host "   cf app coffeex-srv" -ForegroundColor Gray
Write-Host "4. Check approuter logs:"
Write-Host "   cf logs coffeex-approuter --recent" -ForegroundColor Gray

Write-Host "`nPress Enter when ready to test..." -ForegroundColor Cyan
Read-Host 