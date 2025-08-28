// Netlify function to check payment status
const axios = require('axios');

// PayHero API credentials - using the working credentials from quickmartstk
const API_USERNAME = 'LOV1coowH9xMzNtThWjF';
const API_PASSWORD = 'hAxiS4X7B8KWDO2QjdPa2zdEMn0dFw4JST5n0eoW';

// Generate Basic Auth Token
const generateBasicAuthToken = () => {
  const credentials = `${API_USERNAME}:${API_PASSWORD}`;
  return 'Basic ' + Buffer.from(credentials).toString('base64');
};

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };
  
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }
  
  // Process GET request
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }
  
  try {
    // Get reference from path parameter
    const reference = event.path.split('/').pop();
    
    if (!reference) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Payment reference is required' })
      };
    }
    
    const response = await axios({
      method: 'get',
      url: `https://backend.payhero.co.ke/api/v2/payments/${reference}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': generateBasicAuthToken()
      }
    });

    // Normalize status values from PayHero
    const raw = response.data || {};
    const rawStatus = (raw.status || '').toString().toUpperCase();
    const successSet = new Set(['COMPLETED', 'SUCCESS', 'SUCCESSFUL']);
    const failedSet = new Set(['FAILED', 'CANCELLED', 'CANCELED', 'TIMEOUT', 'TIMED_OUT', 'REVERSED', 'DECLINED', 'ERROR']);
    let normalizedStatus = 'PENDING';
    if (successSet.has(rawStatus)) {
      normalizedStatus = 'SUCCESS';
    } else if (failedSet.has(rawStatus)) {
      normalizedStatus = 'FAILED';
    }

    const resultDesc = raw.result_desc || raw.message || (normalizedStatus === 'FAILED' && rawStatus ? `Payment ${rawStatus}` : undefined);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        payment: {
          status: normalizedStatus,
          amount: raw.amount,
          phoneNumber: raw.phone_number,
          mpesaReceiptNumber: raw.mpesa_receipt_number,
          resultDesc
        }
      })
    };
  } catch (error) {
    console.error('Payment status check error:', error.response?.data || error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to check payment status',
        error: error.response?.data || error.message
      })
    };
  }
};
