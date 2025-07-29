# Test Frontend Authentication
Write-Host "🧪 Testing Frontend Authentication Flow" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

# Test 1: Check if backend getCurrentUser works
Write-Host "`n📋 Test 1: Backend getCurrentUser endpoint" -ForegroundColor Yellow
Write-Host "Opening browser to test backend directly..."
Write-Host "URL: https://technische-universit-t-m-nchen-sap-hochschulkompetenzze3525cbaf.cfapps.us10-001.hana.ondemand.com/odata/v4/getCurrentUser()"
Start-Process "https://technische-universit-t-m-nchen-sap-hochschulkompetenzze3525cbaf.cfapps.us10-001.hana.ondemand.com/odata/v4/getCurrentUser()"

Write-Host "`nExpected: Should redirect to login, then show user JSON data"
Write-Host "Press Enter to continue..." -ForegroundColor Cyan
Read-Host

# Test 2: Check approuter
Write-Host "`n📋 Test 2: Approuter Frontend" -ForegroundColor Yellow
Write-Host "Opening browser to test approuter..."
Write-Host "URL: https://technische-universit-t-m-nchen-sap-hochschulkompetenzzenea81862.cfapps.us10-001.hana.ondemand.com/"
Start-Process "https://technische-universit-t-m-nchen-sap-hochschulkompetenzzenea81862.cfapps.us10-001.hana.ondemand.com/"

Write-Host "`nExpected: Should redirect to login, then show coffee app"
Write-Host "Check browser console for:"
Write-Host "  - 'User initialized:' message"
Write-Host "  - Any errors about getCurrentUser"
Write-Host "  - User's actual name instead of 'Lisa'"

# Clean up unused files
Write-Host "`n🧹 Cleaning up unused files..." -ForegroundColor Yellow
$filesToDelete = @(
    "approuter/resources/util/MockUserService.js",
    "test-auth-flow.sh",
    "redeploy-approuter.sh", 
    "quick-approuter-update.sh",
    "manual-db-deploy.sh",
    "emergency-fix.sh",
    "check-logs.sh",
    "deploy-user-fix.sh"
)

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ Deleted: $file" -ForegroundColor Green
    }
}

Write-Host "`n📝 Troubleshooting Tips:" -ForegroundColor Cyan
Write-Host "1. If you see 'Demo User' - authentication failed"
Write-Host "2. If you see your email - authentication worked!"
Write-Host "3. Check browser console (F12) for detailed logs"
Write-Host "4. Look for '✅ User data received from backend' message" 