# CoffeeX Authentication Fix Deployment

## Quick Deploy

1. Make the script executable:
```bash
chmod +x deploy-and-test.sh
```

2. Run the deployment script:
```bash
./deploy-and-test.sh
```

## What the Script Does

1. **Builds the project** using `npm run build:cf`
2. **Deploys to SAP BTP** using `cf deploy`
3. **Shows app status** to confirm deployment
4. **Provides testing instructions** for verifying the authentication fix

## Manual Deployment (if script fails)

If you prefer to run commands manually:

```bash
# 1. Build the project
npm run build:cf

# 2. Deploy to BTP
cf deploy

# 3. Check app status
cf apps

# 4. Monitor logs
cf logs coffeex-srv --recent
```

## Testing the Authentication Fix

After deployment:

1. Navigate to: https://coffeex-simple-approuter.cfapps.us10-001.hana.ondemand.com/
2. Click "Login with SAP ID"
3. Complete SAP authentication
4. You should be redirected back to the app (not to /backend/odata/v4)
5. The welcome screen should show with your user info

## Troubleshooting

If you still encounter errors:

1. Check the backend logs:
   ```bash
   cf logs coffeex-srv --recent
   ```

2. Check the approuter logs:
   ```bash
   cf logs coffeex-simple-approuter --recent
   ```

3. Look for these in the logs:
   - Request URLs and timestamps
   - Authentication state
   - User object structure
   - Error messages with stack traces

The enhanced logging we added will help diagnose any remaining issues. 