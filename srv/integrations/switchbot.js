const axios = require('axios');
const crypto = require('crypto');

// SwitchBot configuration from environment variables
const SWITCHBOT_API_URL = process.env.SWITCHBOT_API_URL || 'https://api.switch-bot.com/v1.1';
const SWITCHBOT_TOKEN = process.env.SWITCHBOT_TOKEN;
const SWITCHBOT_SECRET = process.env.SWITCHBOT_SECRET;

// Safety check - log warning but don't crash
if (!SWITCHBOT_TOKEN || !SWITCHBOT_SECRET) {
  console.warn('⚠️ SwitchBot API credentials (TOKEN or SECRET) are missing. SwitchBot integration disabled.');
}

/**
 * Brew command — triggers the switch for a coffee machine
 * @param {string} machineId - UUID of the coffee machine
 * @returns {Promise<boolean>}
 */
async function brew(machineId) {
  try {
    // Check if credentials are available
    if (!SWITCHBOT_TOKEN || !SWITCHBOT_SECRET) {
      console.log('🔧 SwitchBot integration disabled - no credentials');
      return false;
    }
    
    const deviceId = mapMachineToDevice(machineId);
    if (!deviceId) {
      console.warn(`⚠️ No device mapped for machineId: ${machineId}`);
      return false;
    }

    // Auth signature setup
    const t = Date.now();
    const nonce = Math.random().toString(36).substring(2);
    const stringToSign = SWITCHBOT_TOKEN + t + nonce;

    const sign = crypto.createHmac('sha256', SWITCHBOT_SECRET)
        .update(Buffer.from(stringToSign, 'utf-8'))
        .digest('base64');

    const headers = {
      Authorization: SWITCHBOT_TOKEN,
      sign,
      t: t.toString(),
      nonce,
      'Content-Type': 'application/json',
    };

    const body = {
      command: 'press',
      parameter: 'default',
      commandType: 'command',
    };

    const url = `${SWITCHBOT_API_URL}/devices/${deviceId}/commands`;

    const response = await axios.post(url, body, { headers });

    if (response.data.statusCode === 100) {
      console.log(`✅ Brew triggered for ${machineId} (device ${deviceId})`);
      return true;
    } else {
      console.error('❌ SwitchBot API error:', response.data);
      return false;
    }

  } catch (err) {
    console.error(`❌ Brew failed for ${machineId}:`, err.message);
    return false;
  }
}

/**
 * Maps a machine UUID to a registered SwitchBot device ID
 * @param {string} machineId
 * @returns {string|null}
 */
function mapMachineToDevice(machineId) {
  const deviceMap = {
    '5bd4f91f-d9b4-4573-88df-11b2f14e7c78': process.env.SWITCHBOT_DEVICEID_COFFEE90,
    // Extend here for more devices
  };
  return deviceMap[machineId] || null;
}

module.exports = {
  brew,
};