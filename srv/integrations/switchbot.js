const axios = require('axios')

// Switch-Bot configuration
const SWITCHBOT_API_URL = process.env.SWITCHBOT_API_URL || 'https://api.switch-bot.com/v1.1'
const SWITCHBOT_TOKEN = process.env.SWITCHBOT_TOKEN || 'your-switchbot-token'
const SWITCHBOT_SECRET = process.env.SWITCHBOT_SECRET || 'your-switchbot-secret'

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
    // Add your actual machine-to-device mappings here
    'mock-machine-1': 'switchbot-device-1',
    'mock-machine-2': 'switchbot-device-2'
  }
  
  return deviceMap[machineId] || null
}

module.exports = {
  brew
} 