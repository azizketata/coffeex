#!/bin/bash

# --- CONFIGURATION ---
APP_BASE_URL="https://technische-universit-t-m-nchen-sap-hochschulkompetenzze10654f97.cfapps.us10-001.hana.ondemand.com"
TAP_ENDPOINT="$APP_BASE_URL/backend/odata/v4/Tap"
MACHINE_ID="5bd4f91f-d9b4-4573-88df-11b2f14e7c78"
USER_ID="27b8c76f-942e-4011-b1f3-23a42d293e4f"
SESSION_COOKIE='JSESSIONID=s%3AdcEWcQoVgCxLvG9yjqptjD7FPZAv-Wor.wmi6YUJxiuKP%2Fp7P%2FQsqEQc92%2BP5SiiqejPWMU1osHE; __VCAP_ID__=aabfcc31-72d0-4d36-6c06-4173'

# --- STEP 1: Fetch CSRF Token ---
echo "🔐 Fetching CSRF token..."

csrf_response=$(curl -s -D - "${APP_BASE_URL}/backend/odata/v4/" \
  -H "Cookie: ${SESSION_COOKIE}" \
  -H "X-CSRF-Token: Fetch")

# Extract CSRF token from headers
CSRF_TOKEN=$(echo "$csrf_response" | grep -i "x-csrf-token:" | awk '{print $2}' | tr -d '\r')
echo "✅ CSRF Token: $CSRF_TOKEN"

# --- WAIT BUFFER ---
echo "⏳ Waiting 20 seconds before sending brew request..."
sleep 20

# --- SEND TAP REQUEST ---
echo "☕ Triggering Tap action..."
curl -X POST "${TAP_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -H "Cookie: $SESSION_COOKIE" \
  -d "{\"machineId\": \"${MACHINE_ID}\", \"userId\": \"${USER_ID}\"}" \
  -i