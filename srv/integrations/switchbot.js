const axios = require('axios')

// Switch-Bot configuration
const SWITCHBOT_API_URL = process.env.SWITCHBOT_API_URL
const SWITCHBOT_TOKEN = process.env.SWITCHBOT_TOKEN
const SWITCHBOT_SECRET = process.env.SWITCHBOT_SECRET
const SWITCHBOT_DEVICEID = process.env.SWITCHBOT_DEVICEID_COFFEE90

if (!SWITCHBOT_TOKEN || !SWITCHBOT_SECRET) {
  throw new Error('SwitchBot API credentials are missing.');
}

/**
 * Trigger coffee brewing on a specific machine
 * @param {string} machineId - The machine UUID
 * @returns {Promise<boolean>} - Success status
 */
async function brew(machineId) {
  try {
    // In production, you would map machineId to actual Switch-Bot device ID
    const deviceId = mapMachineToDevice(machineId)

    if (!deviceId) {
      console.error(`No Switch-Bot device mapped for machine ${machineId}`)
      return false
    }
    
    // Create signature for authentication
    const t = Date.now()
    const nonce = Math.random().toString(36).substring(2, 15)
    const data = SWITCHBOT_TOKEN + t + nonce
    const crypto = require('crypto')
    const sign = crypto.createHmac('sha256', SWITCHBOT_SECRET)
      .update(Buffer.from(data, 'utf-8'))
      .digest('base64')
    
    // Send command to Switch-Bot
    const response = await axios.post(
      `${SWITCHBOT_API_URL}/devices/${deviceId}/commands`,
      {
        command: 'press',
        parameter: 'default',
        commandType: 'command'
      },
      {
        headers: {
          'Authorization': SWITCHBOT_TOKEN,
          'sign': sign,
          't': t,
          'nonce': nonce,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (response.data.statusCode === 100) {
      console.log(`Successfully triggered brew on machine ${machineId}`)
      return true
    } else {
      console.error(`Switch-Bot command failed:`, response.data)
      return false
    }
    
  } catch (error) {
    console.error(`Failed to trigger Switch-Bot for machine ${machineId}:`, error.message)
    return false
  }
}

/**
 * Map machine UUID to Switch-Bot device ID
 * In production, this would be a database lookup or configuration
 */
function mapMachineToDevice(machineId) {
  // Mock mapping for development
  const deviceMap = {
    [machineId]: SWITCHBOT_DEVICEID
    // Add future machines here
  }

  return deviceMap[machineId] || null
}

module.exports = {
  brew
} 