import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dbpbvoqfexofyxcexmmp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRicGJ2b3FmZXhvZnl4Y2V4bW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDc0NTMsImV4cCI6MjA3NDkyMzQ1M30.hGn7ux2xnRxseYCjiZfCLchgOEwIlIAUkdS6h7byZqc'

const supabase = createClient(supabaseUrl, supabaseKey);

const API_KEY = 'PSFXyLBOrRV9';
const EMAIL = 'frankyfreaky103@gmail.com';

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
    const { phoneNumber, amount = 125, description = 'Survey Platform Fee' } = req.body;
    
    console.log('Parsed request:', { phoneNumber, amount, description });
    
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    
    // Generate a unique reference for this payment
    const externalReference = `Fries-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Prepare PesaFlux payload with centralized webhook
    const pesafluxPayload = {
      api_key: API_KEY,
      email: EMAIL,
      amount: amount.toString(),
      msisdn: phoneNumber,
      reference: externalReference,
      callback_url: "https://checkoutcompletion.vercel.app/api/webhook",
    };
    
    console.log('Making API request to PesaFlux');
    
    const response = await fetch('https://api.pesaflux.co.ke/v1/initiatestk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      body: JSON.stringify(pesafluxPayload),
    });

    const responseText = await response.text();
    console.log('PesaFlux response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse PesaFlux response:', responseText);
      return res.status(502).json({ 
        success: false,
        message: 'Invalid response from payment service' 
      });
    }

    if (data.success === '200' || data.success === 200) {
      // Store transaction in Supabase
      try {
        console.log('Attempting to save transaction to Supabase...');
        const transactionData = {
          transaction_request_id: data.transaction_request_id,
          status: 'pending',
          amount: amount,
          phone: phoneNumber,
          email: EMAIL,
          reference: externalReference,
        };
        console.log('Transaction data to save:', transactionData);
        
        const { data: insertResult, error: dbError } = await supabase
          .from('transactions')
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
          externalReference: data.transaction_request_id,
          checkoutRequestId: data.transaction_request_id,
          transactionRequestId: data.transaction_request_id
        }
      });
    } else {
      console.error('PesaFlux error:', data);
      return res.status(400).json({
        success: false,
        message: data.massage || data.message || 'Payment initiation failed',
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
