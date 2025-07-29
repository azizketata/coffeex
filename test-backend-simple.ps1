# Simple Backend Test
Write-Host "Testing CoffeeX Backend Endpoints" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

$backend = "https://technische-universit-t-m-nchen-sap-hochschulkompetenzze3525cbaf.cfapps.us10-001.hana.ondemand.com"

# Test endpoints
$endpoints = @(
    @{Name="Service Root"; URL="$backend/odata/v4/"},
    @{Name="Users"; URL="$backend/odata/v4/Users"},
    @{Name="Machines"; URL="$backend/odata/v4/Machines"},
    @{Name="CoffeeTx"; URL="$backend/odata/v4/CoffeeTx"},
    @{Name="RefillEvents"; URL="$backend/odata/v4/RefillEvents"},
    @{Name="LowBalanceUsers"; URL="$backend/odata/v4/LowBalanceUsers"},
    @{Name="TopUpTransactions"; URL="$backend/odata/v4/TopUpTransactions"},
    @{Name="Get Current User"; URL="$backend/odata/v4/getCurrentUser%28%29"},
    @{Name="Health Check"; URL="$backend/health"}
)

Write-Host "`nOpening endpoints in browser tabs..."
Write-Host "Login if prompted with your SAP credentials.`n"

foreach ($endpoint in $endpoints) {
    Write-Host "Opening: $($endpoint.Name)" -ForegroundColor Yellow
    Write-Host "URL: $($endpoint.URL)" -ForegroundColor Cyan
    Start-Process $endpoint.URL
    Start-Sleep -Seconds 2
}

Write-Host "`nAll endpoints opened!" -ForegroundColor Green
Write-Host "`nCheck each tab to see:"
Write-Host "- Service root: Available entity sets"
Write-Host "- Users/Machines: Should have sample data"
Write-Host "- Transactions: May be empty initially"
Write-Host "- getCurrentUser: Your authenticated user info"
Write-Host "- Health: Should show UP status" 