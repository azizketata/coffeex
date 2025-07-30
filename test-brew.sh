#!/bin/bash

# --- CONFIGURATION ---
# Approuter URL from cf apps output
APPROUTER_URL="https://technische-universit-t-m-nchen-sap-hochschulkompetenzze10654f97.cfapps.us10-001.hana.ondemand.com"
APP_BASE_URL="$APPROUTER_URL"
TAP_ENDPOINT="$APP_BASE_URL/backend/odata/v4/Tap"
TOPUP_ENDPOINT="$APP_BASE_URL/backend/odata/v4/TopUp"
MACHINE_ID="5bd4f91f-d9b4-4573-88df-11b2f14e7c78"
USER_ID="27b8c76f-942e-4011-b1f3-23a42d293e4f"
# You may need to get a fresh session cookie by logging into the approuter
SESSION_COOKIE='JSESSIONID=s%3A_KuSAjtKrpLldCNBMbwc_k7_AoXdDU5P.ltcYNCSYQnXMaNoaXvTCz0PbF8R5QHzr1%2BZCdnj%2FJRs; _VCAP_ID_=617ce74c-625b-46ff-701c-ea61'

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# --- STEP 1: Fetch CSRF Token ---
echo -e "${GREEN}🔐 Fetching CSRF token...${NC}"

csrf_response=$(curl -s -D - "${APP_BASE_URL}/backend/odata/v4/" \
  -H "Cookie: ${SESSION_COOKIE}" \
  -H "X-CSRF-Token: Fetch")

# Extract CSRF token from headers
CSRF_TOKEN=$(echo "$csrf_response" | grep -i "x-csrf-token:" | awk '{print $2}' | tr -d '\r')
echo -e "${GREEN}✅ CSRF Token: $CSRF_TOKEN${NC}"

# --- STEP 2: Test Normal Coffee ---
echo -e "\n${GREEN}☕ Testing NORMAL coffee...${NC}"
curl -X POST "${TAP_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -H "Cookie: $SESSION_COOKIE" \
  -d "{\"machineId\": \"${MACHINE_ID}\", \"userId\": \"${USER_ID}\", \"coffeeType\": \"NORMAL\"}" \
  -i

echo -e "\n"

# --- STEP 3: Test Double Coffee ---
echo -e "\n${GREEN}☕☕ Testing DOUBLE coffee...${NC}"
curl -X POST "${TAP_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -H "Cookie: $SESSION_COOKIE" \
  -d "{\"machineId\": \"${MACHINE_ID}\", \"userId\": \"${USER_ID}\", \"coffeeType\": \"DOUBLE\"}" \
  -i

echo -e "\n"

# --- STEP 4: Test TopUp ---
echo -e "\n${GREEN}💳 Testing TopUp (€10)...${NC}"
curl -X POST "${TOPUP_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -H "Cookie: $SESSION_COOKIE" \
  -d "{\"amount\": 10}" \
  -i

echo -e "\n"