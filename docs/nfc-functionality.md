# CoffeeX NFC Tag Integration Documentation

## Overview
The CoffeeX application now supports NFC tag scanning functionality, allowing users to quickly select a coffee machine by scanning an NFC tag attached to the machine.

## How It Works

### 1. NFC Tag URL Format
Each coffee machine has an NFC tag programmed with a URL in the following format:
```
https://[your-btp-app-url]/?machineId=[machine-uuid]
```

Example:
```
https://technische-universit-t-m-nchen-sap-hochschulkompetenzze10654f97.cfapps.us10-001.hana.ondemand.com/?machineId=5bd4f91f-d9b4-4573-88df-11b2f14e7c78
```

### 2. Technical Implementation

#### Component.js (URL Parameter Extraction)
- Extracts `machineId` from URL query parameters when the app loads
- Stores the machine ID in:
  - A global machine model (`this.setModel(machineModel, "machine")`)
  - localStorage for persistence (`localStorage.setItem("machineId", machineId)`)

#### Home.controller.js (Machine Selection Logic)
- **onInit**: Checks for existing machine selection from component model or localStorage
- **loadMachineDetails**: Fetches machine information (location, bean level) from backend
- **onOrderCoffee**: Uses the selected machine ID instead of defaulting to the first available machine
- **onSelectMachine**: Opens a dialog for manual machine selection if needed

#### Home.view.xml (UI Updates)
- Displays selected machine location with location icon
- Shows machine status and bean level only when a machine is selected
- Provides "Select Machine" / "Change Machine" button with NFC tag icon

### 3. User Experience Flow

1. **Scanning NFC Tag**:
   - User taps phone on NFC tag attached to coffee machine
   - Phone opens the CoffeeX URL with machine ID parameter
   - User logs in (if not already authenticated)
   - App automatically selects the scanned machine

2. **Visual Feedback**:
   - Machine location is displayed (e.g., "TUM SAP UCC - Building A")
   - Machine status (online/offline) and bean level are shown
   - Selected machine persists across sessions

3. **Manual Selection**:
   - Users can click "Select Machine" / "Change Machine" button
   - Opens a dialog listing all available machines
   - Selection updates the URL and localStorage

### 4. Route Handling
The app supports two URL patterns for machine selection:
- Query parameter: `/?machineId=xxx` (primary method for NFC tags)
- Route parameter: `#/user/home/xxx` (alternative for direct navigation)

## Test Machine IDs
For testing purposes, use these machine IDs from the database:
- Building A: `5bd4f91f-d9b4-4573-88df-11b2f14e7c78`
- Building B: `a2c3d4e5-f6a7-48b9-0c1d-2e3f4a5b6c7d`

## Backend Integration
The selected machine ID is sent with coffee orders:
```javascript
jQuery.ajax({
    url: "/backend/odata/v4/Tap",
    method: "POST",
    data: JSON.stringify({
        machineId: machineId,  // Selected machine ID
        userId: userId,
        coffeeType: isDouble ? "DOUBLE" : "NORMAL"
    })
});
```

## Error Handling
- If an invalid machine ID is scanned, the app shows "Machine not found" message
- Machine selection is cleared from localStorage
- User is prompted to scan a valid NFC tag or select manually

## Security Considerations
- Machine selection is stored client-side only
- Backend validates machine existence and availability
- User authentication is required before any coffee orders

## Future Enhancements
1. QR code support as fallback for devices without NFC
2. Machine-specific pricing or menu options
3. Real-time machine status updates via WebSocket
4. Geolocation validation to ensure user is near the machine