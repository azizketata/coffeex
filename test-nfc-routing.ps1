#!/usr/bin/env pwsh
# Test script for NFC tag routing functionality

Write-Host "=== CoffeeX NFC Tag Routing Test ===" -ForegroundColor Green
Write-Host ""

# Frontend URL (update this with your actual BTP URL)
$frontendUrl = "https://technische-universit-t-m-nchen-sap-hochschulkompetenzze10654f97.cfapps.us10-001.hana.ondemand.com"

# Test machine IDs from the database
$machineIds = @(
    "5bd4f91f-d9b4-4573-88df-11b2f14e7c78",  # Building A
    "a2c3d4e5-f6a7-48b9-0c1d-2e3f4a5b6c7d"   # Building B
)

Write-Host "Available test URLs for NFC tag simulation:" -ForegroundColor Yellow
Write-Host ""

foreach ($machineId in $machineIds) {
    $nfcUrl = "${frontendUrl}?machineId=${machineId}"
    Write-Host "Machine ID: $machineId" -ForegroundColor Cyan
    Write-Host "NFC URL: $nfcUrl" -ForegroundColor White
    Write-Host ""
}

Write-Host "How to test NFC functionality:" -ForegroundColor Yellow
Write-Host "1. Open one of the URLs above in your browser"
Write-Host "2. Login with your test user credentials"
Write-Host "3. You should be redirected to the user home page"
Write-Host "4. The machine location should be displayed automatically"
Write-Host "5. When you order coffee, it will use the selected machine"
Write-Host ""
Write-Host "Alternative test with route parameter:" -ForegroundColor Yellow
Write-Host "${frontendUrl}/frontend/webapp/index.html#/user/home/${machineIds[0]}"
Write-Host ""
Write-Host "Note: The machine ID will be stored in localStorage and persists across sessions" -ForegroundColor Gray