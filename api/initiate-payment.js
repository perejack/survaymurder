import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const SWIFTPAY_API_KEY = process.env.SWIFTPAY_API_KEY || process.env.VITE_SWIFTPAY_API_KEY;
const SWIFTPAY_TILL_ID = process.env.SWIFTPAY_TILL_ID || process.env.VITE_SWIFTPAY_TILL_ID;
const SWIFTPAY_BACKEND_URL =
  process.env.SWIFTPAY_BACKEND_URL ||
  process.env.VITE_SWIFTPAY_BACKEND_URL ||
  'https://swiftpay-backend-uvv9.onrender.com';

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    let body;
    try {
      body = req.body;
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
    }

    const { phoneNumber, amount = 20, description = 'Survey Platform Fee' } = body || {};
    
    console.log('Parsed request:', { phoneNumber, amount, description });
    
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        message: 'Server is missing Supabase configuration'
      });
    }

    if (!SWIFTPAY_API_KEY || !SWIFTPAY_TILL_ID) {
      return res.status(500).json({
        success: false,
        message: 'Server is missing SwiftPay configuration'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate a unique reference for this payment
    const externalReference = `Fries-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let cleanedPhone = String(phoneNumber).replace(/\s+/g, '').replace(/\D/g, '');
    if (cleanedPhone.startsWith('0')) {
      cleanedPhone = `254${cleanedPhone.substring(1)}`;
    }
    if (!cleanedPhone.startsWith('254')) {
      cleanedPhone = `254${cleanedPhone}`;
    }

    const swiftpayPayload = {
      phone_number: cleanedPhone,
      amount: Number(amount),
      till_id: SWIFTPAY_TILL_ID,
      reference: externalReference,
      description
    };

    console.log('Making API request to SwiftPay');

    const response = await fetch(`${SWIFTPAY_BACKEND_URL}/api/mpesa/stk-push-api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SWIFTPAY_API_KEY}`
      },
      body: JSON.stringify(swiftpayPayload),
    });

    const responseText = await response.text();
    console.log('SwiftPay response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse SwiftPay response:', responseText);
      return res.status(502).json({ 
        success: false,
        message: 'Invalid response from payment service' 
      });
    }

    const checkoutId =
      data?.data?.checkout_id ||
      data?.data?.checkoutId ||
      data?.checkout_id ||
      data?.checkoutId ||
      data?.checkoutRequestId ||
      data?.data?.checkoutRequestId;

    const ok = response.ok && (data?.success === true || data?.status === 'success');

    if (ok && checkoutId) {
      // Store transaction in Supabase
      try {
        console.log('Attempting to save transaction to Supabase...');
        const transactionData = {
          checkout_request_id: checkoutId,
          external_reference: externalReference,
          status: 'pending',
          amount: Number(amount),
          phone_number: cleanedPhone,
        };
        console.log('Transaction data to save:', transactionData);
        
        const { data: insertResult, error: dbError } = await supabase
          .from('payments')
          .insert(transactionData)
          .select();

        if (dbError) {
          console.error('Database insert error:', dbError);
        } else {
          console.log('Transaction stored in database successfully:', insertResult);
        }
      } catch (dbErr) {
        console.error('Database error:', dbErr);
      }

      return res.status(200).json({
        success: true,
        message: 'Payment initiated successfully',
        data: {
          externalReference: checkoutId,
          checkoutRequestId: checkoutId,
          transactionRequestId: checkoutId
        }
      });
    } else {
      console.error('SwiftPay error:', data);
      return res.status(400).json({
        success: false,
        message: data.message || data.error || 'Payment initiation failed',
        error: data
      });
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.message
    });
  }
};
