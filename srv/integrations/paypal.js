const axios = require('axios')
require('dotenv').config();

// PayPal configuration
const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com'
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID 
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const FRONTPORT = 3003 //idk yet

// Cache for access token
let accessToken = null
let tokenExpiry = null

/**
 * Get PayPal access token
 * @returns {Promise<string>} - Access token
 */
async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && tokenExpiry > Date.now()) {
    return accessToken
  }
  
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
    
    const response = await axios.post(
      `${PAYPAL_API_URL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
    
    accessToken = response.data.access_token
    // Set token expiry 5 minutes before actual expiry
    tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000
    
    return accessToken
  } catch (error) {
    console.error('Failed to get PayPal access token:', error.message)
    throw error
  }
}

/**
 * Capture payment for a coffee transaction
 * @param {Object} transaction - The coffee transaction object
 * @returns {Promise<boolean>} - Success status
 */
async function capture(transaction) {
  try {
    const token = await getAccessToken()
    
    // Create order for the transaction
    const orderResponse = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: transaction.txId,
          amount: {
            currency_code: 'EUR',
            value: transaction.price.toString()
          },
          description: `Coffee purchase - Transaction ${transaction.txId}`
        }],
        application_context: {
          user_action: 'PAY_NOW'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    const orderId = orderResponse.data.id
    
    // In a real implementation, you would:
    // 1. Store the order ID with the transaction
    // 2. Have the user authorize the payment
    // 3. Then capture the authorized payment
    
    // For this example, we'll simulate immediate capture
    // In production, this would happen after user authorization
    const captureResponse = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (captureResponse.data.status === 'COMPLETED') {
      console.log(`Successfully captured payment for transaction ${transaction.txId}`)
      return true
    } else {
      console.error(`Payment capture failed for transaction ${transaction.txId}:`, captureResponse.data)
      return false
    }
    
  } catch (error) {
    console.error(`Failed to capture payment for transaction ${transaction.txId}:`, error.message)
    
    // Log more details for debugging
    if (error.response) {
      console.error('PayPal API error:', error.response.data)
    }
    
    return false
  }
}

/**
 * Process refund for a transaction
 * @param {string} captureId - The PayPal capture ID
 * @param {number} amount - Amount to refund
 * @returns {Promise<boolean>} - Success status
 */
async function refund(captureId, amount) {
  try {
    const token = await getAccessToken()
    
    const response = await axios.post(
      `${PAYPAL_API_URL}/v2/payments/captures/${captureId}/refund`,
      {
        amount: {
          value: amount.toString(),
          currency_code: 'EUR'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    return response.data.status === 'COMPLETED'
    
  } catch (error) {
    console.error(`Failed to process refund:`, error.message)
    return false
  }
}

async function createOrder(amount, referenceId) {
  const token = await getAccessToken()

  const response = await axios.post(
    `${PAYPAL_API_URL}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: referenceId,
        amount: {
          currency_code: 'EUR',
          value: amount.toString()
        },
        description: `Top-up ${referenceId}`
      }],
      application_context: {
        return_url: `http://localhost:4004/paypal/success?txId=${referenceId}`,
        cancel_url: `https://localhost:${FRONTPORT}/topup/cancel`,
        user_action: 'PAY_NOW'
      }
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  )

  return response.data.id
}


async function captureOrder(orderId) {
  try {
    const token = await getAccessToken()
    
    const captureResponse = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
      {}, // empty payload
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('Capture result:', captureResponse.data)

    return captureResponse.data.status === 'COMPLETED'
  } catch (error) {
    console.error('Failed to capture PayPal order:', error.response?.data || error.message)
    throw error
  }
}


module.exports = {
  capture,
  refund,
  createOrder,
  captureOrder
} 