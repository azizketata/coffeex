#!/bin/bash
# Simple fix - add sqlite3 temporarily to get app running

echo "🔧 Simple HANA Fix"
echo "=================="

# Stop the app
echo "⏹️ Stopping app..."
cf stop coffeex-srv

# Option 1: Force restage with production profile
echo -e "\n🔄 Restaging app with production profile..."
cf set-env coffeex-srv CDS_ENV production
cf set-env coffeex-srv NODE_ENV production
cf set-env coffeex-srv cds_requires_db_kind hana-cloud
cf set-env coffeex-srv CDS_REQUIRES_DB_KIND hana-cloud

# Force CDS to use HANA
cf set-env coffeex-srv CDS_CONFIG '{"requires":{"db":{"kind":"hana-cloud"}}}'

# Restage (rebuild) the app
echo -e "\n🏗️ Restaging app..."
cf restage coffeex-srv

# If restage fails, check logs
echo -e "\n📜 Checking startup logs..."
sleep 30
cf logs coffeex-srv --recent | tail -50 