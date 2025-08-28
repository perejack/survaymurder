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
    // Get reference from path parameter - handle both direct path and query params
    let reference = null;
    
    // Try to get from path first
    if (event.path && event.path.includes('/payment-status/')) {
      reference = event.path.split('/payment-status/')[1];
    }
    
    // If not found in path, try pathParameters (Netlify Functions format)
    if (!reference && event.pathParameters && event.pathParameters.reference) {
      reference = event.pathParameters.reference;
    }
    
    // If still not found, try query parameters
    if (!reference && event.queryStringParameters && event.queryStringParameters.reference) {
      reference = event.queryStringParameters.reference;
    }
    
    console.log('Payment status check - Reference:', reference, 'Path:', event.path, 'PathParams:', event.pathParameters);
    
    if (!reference) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'Payment reference is required',
          debug: {
            path: event.path,
            pathParameters: event.pathParameters,
            queryStringParameters: event.queryStringParameters
          }
        })
      };
    }
    
    console.log('Making PayHero API request for reference:', reference);
    
    const response = await axios({
      method: 'get',
      url: `https://backend.payhero.co.ke/api/v2/payments/${reference}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': generateBasicAuthToken()
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('PayHero API response:', response.data);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        payment: {
          status: response.data.status || 'PENDING',
          amount: response.data.amount,
          phoneNumber: response.data.phone_number,
          mpesaReceiptNumber: response.data.mpesa_receipt_number,
          resultDesc: response.data.result_desc
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
