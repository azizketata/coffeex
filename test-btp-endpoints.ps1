# CoffeeX BTP Endpoint Testing Script

param(
    [string]$AppName = "coffeex-srv"
)

Write-Host "🧪 Testing CoffeeX Endpoints on BTP" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

# Get app URL
$appInfo = cf app $AppName 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ App '$AppName' not found" -ForegroundColor Red
    Write-Host "Run 'cf apps' to see available apps" -ForegroundColor Yellow
    exit 1
}

$appUrl = ($appInfo | Select-String "routes:").ToString().Split()[1]
$baseUrl = "https://$appUrl"

Write-Host "✅ Found app at: $baseUrl" -ForegroundColor Green

# Test health endpoints
Write-Host "`n📊 Testing Health Endpoints..." -ForegroundColor Cyan
Write-Host "------------------------------" -ForegroundColor Gray

$healthUrl = "$baseUrl/health"
Write-Host "Testing: $healthUrl"
try {
    $response = Invoke-RestMethod -Uri $healthUrl -Method Get
    Write-Host "✅ Health Status: $($response.status)" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}

# Test liveness
Write-Host "`n🫀 Testing Liveness..." -ForegroundColor Cyan
$liveUrl = "$baseUrl/health/live"
try {
    $response = Invoke-RestMethod -Uri $liveUrl -Method Get
    Write-Host "✅ Liveness: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Liveness check failed: $_" -ForegroundColor Red
}

# Test readiness
Write-Host "`n🚦 Testing Readiness..." -ForegroundColor Cyan
$readyUrl = "$baseUrl/health/ready"
try {
    $response = Invoke-RestMethod -Uri $readyUrl -Method Get
    Write-Host "✅ Readiness: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Readiness check failed: $_" -ForegroundColor Red
}

# Test OData metadata
Write-Host "`n📡 Testing OData Service..." -ForegroundColor Cyan
Write-Host "------------------------------" -ForegroundColor Gray
$metadataUrl = "$baseUrl/odata/v4/`$metadata"
Write-Host "Testing: $metadataUrl"
try {
    $response = Invoke-WebRequest -Uri $metadataUrl -Method Get
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ OData metadata accessible" -ForegroundColor Green
        Write-Host "Response size: $($response.Content.Length) bytes" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ OData metadata failed: $_" -ForegroundColor Red
}

# Test entity endpoints
Write-Host "`n📊 Testing OData Entities..." -ForegroundColor Cyan
Write-Host "------------------------------" -ForegroundColor Gray

$entities = @("Users", "Machines", "CoffeeTxes", "RefillEvents", "LowBalanceUsers")
foreach ($entity in $entities) {
    $entityUrl = "$baseUrl/odata/v4/$entity"
    Write-Host "`nTesting $entity : $entityUrl"
    try {
        $response = Invoke-RestMethod -Uri $entityUrl -Method Get
        $count = $response.value.Count
        Write-Host "✅ $entity accessible - Count: $count" -ForegroundColor Green
        if ($count -gt 0) {
            Write-Host "First item:" -ForegroundColor Gray
            $response.value[0] | ConvertTo-Json -Compress
        }
    } catch {
        Write-Host "❌ $entity failed: $_" -ForegroundColor Red
    }
}

# Test actions (these will fail without auth, but we can check the error)
Write-Host "`n🔐 Testing Protected Actions..." -ForegroundColor Cyan
Write-Host "------------------------------" -ForegroundColor Gray
Write-Host "(These should fail with 401/403 without authentication)" -ForegroundColor Yellow

$tapUrl = "$baseUrl/odata/v4/Tap"
Write-Host "`nTesting Tap action: $tapUrl"
try {
    $body = @{
        machineId = "test-machine"
        userId = "test-user"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri $tapUrl -Method Post -Body $body -ContentType "application/json"
    Write-Host "⚠️ Tap succeeded (no auth required?)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✅ Tap properly protected (got $($_.Exception.Response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error: $_" -ForegroundColor Red
    }
}

# Show logs command
Write-Host "`n📜 To view application logs, run:" -ForegroundColor Cyan
Write-Host "cf logs $AppName --recent" -ForegroundColor White 