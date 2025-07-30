# CoffeeX BTP Deployment Script (PowerShell)
# This script deploys the CoffeeX app to SAP BTP with proper HANA configuration

Write-Host "🚀 CoffeeX BTP Deployment" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# Stop app if running
Write-Host "`n⏹️ Stopping app if running..." -ForegroundColor Yellow
cf stop coffeex-srv 2>$null

# Set environment variables for HANA
Write-Host "`n🔧 Setting environment variables..." -ForegroundColor Yellow
cf set-env coffeex-srv CDS_ENV production
cf set-env coffeex-srv NODE_ENV production
cf set-env coffeex-srv cds_requires_db_kind hana-cloud

# Set Scaleway SQS environment variables
Write-Host "`n🔐 Setting Scaleway SQS credentials..." -ForegroundColor Yellow
cf set-env coffeex-srv SCALEWAY_ACCESS_KEY "It4rjFC3VR8c2MfRl1zz"
cf set-env coffeex-srv SCALEWAY_SECRET_KEY "A7ym6TJlxTOFyvw8I45L4mNknf6NW252AAw3vX1JaKqNzuvrc5VBowWffLjaPLtb"
cf set-env coffeex-srv SCALEWAY_QUEUE_URL "https://sqs.mnq.fr-par.scaleway.com/project-e9c9a739-08cc-40e1-849b-91d54e62c795/ucc-tum-coffee"
cf set-env coffeex-srv SCALEWAY_SQS_ENDPOINT "https://sqs.mnq.fr-par.scaleway.com"
cf set-env coffeex-srv USE_SCALEWAY_SQS "true"

# Set SwitchBot environment variables
cf set-env coffeex-srv SWITCHBOT_API_URL "https://api.switch-bot.com/v1.1"
cf set-env coffeex-srv SWITCHBOT_TOKEN  "3a249e1ccd4cce9264f3ace8a8e34f44180c9c7a93023ebbb37997df648908ae37064f00deb08f4bb214465705d50bfe"
cf set-env coffeex-srv SWITCHBOT_SECRET "e3e905552516e7313cc90319415fe7c0"
cf set-env coffeex-srv SWITCHBOT_DEVICEID_COFFEE90 "CD3430374B90"

# Create production config
Write-Host "`n📝 Creating production configuration..." -ForegroundColor Yellow
@'
{
  "build": {
    "target": "gen"
  },
  "requires": {
    "db": {
      "kind": "hana-cloud"
    },
    "auth": {
      "kind": "xsuaa"
    },
    "messaging": {
      "impl": "./srv/mocks/scaleway-messaging.js",
      "kind": "scaleway-sqs"
    },
    "alerting": {
      "kind": "alert-notification"
    }
  },
  "features": {
    "serve_on_root": true
  }
}
'@ | Out-File -FilePath .cdsrc-production.json -Encoding UTF8

# Push the app
Write-Host "`n🚀 Deploying app to BTP..." -ForegroundColor Yellow
cf push coffeex-srv `
  -p . `
  -m 512M `
  -k 1G `
  -b nodejs_buildpack `
  --no-start

# Start the app
Write-Host "`n▶️ Starting app..." -ForegroundColor Yellow
cf start coffeex-srv

# Get app URL
$appInfo = cf app coffeex-srv
$routeLine = $appInfo | Select-String "routes:"
$appUrl = ($routeLine -split '\s+')[1]

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "📍 Check your app at: https://$appUrl" -ForegroundColor Cyan
Write-Host "`n📊 Monitor logs with: cf logs coffeex-srv --recent" -ForegroundColor Gray 