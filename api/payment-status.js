import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const SWIFTPAY_API_KEY = process.env.SWIFTPAY_API_KEY || process.env.VITE_SWIFTPAY_API_KEY;
const SWIFTPAY_BACKEND_URL =
  process.env.SWIFTPAY_BACKEND_URL ||
  process.env.VITE_SWIFTPAY_BACKEND_URL ||
  'https://swiftpay-backend-uvv9.onrender.com';

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).send('');
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { reference } = req.query;
    const debug = String(req.query?.debug || '') === '1';
    
    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required'
      });
    }

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        message: 'Server is missing Supabase configuration'
      });
    }

    if (!SWIFTPAY_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Server is missing SwiftPay configuration'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Checking status for reference:', reference);

    // Try to read the payment row from DB, but do not fail the request if the table is missing.
    // We can still poll SwiftPay directly using the checkoutId/reference.
    let transaction = null;
    try {
      const { data, error: dbError } = await supabase
        .from('payments')
        .select('*')
        .or(`external_reference.eq.${reference},checkout_request_id.eq.${reference}`)
        .maybeSingle();

      if (dbError) {
        console.error('Database query error (continuing with provider polling):', dbError);
      } else {
        transaction = data;
      }
    } catch (dbErr) {
      console.error('Database query exception (continuing with provider polling):', dbErr);
    }
    
    const checkoutId = transaction?.checkout_request_id || String(reference);
    const currentStatus = (transaction?.status || 'pending').toLowerCase();

    if (transaction && (currentStatus === 'success' || currentStatus === 'failed' || currentStatus === 'cancelled')) {
      console.log(`Payment status already finalized for ${reference}:`, transaction.status);

      return res.status(200).json({
        success: true,
        payment: {
          status: currentStatus === 'success' ? 'SUCCESS' : 'FAILED',
          amount: transaction.amount,
          phoneNumber: transaction.phone_number,
          mpesaReceiptNumber: transaction.mpesa_receipt_number,
          resultDesc: transaction.result_desc,
          resultCode: transaction.result_code,
          timestamp: transaction.updated_at
        }
      });
    }

    // Poll SwiftPay directly (so UI polling transitions pending -> success/failed without relying on a webhook)
    let providerData;
    let providerHttpStatus;
    let providerRawText;
    try {
      const swiftpayRes = await fetch(`${SWIFTPAY_BACKEND_URL}/api/mpesa-verification-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          checkoutId,
          apiKey: SWIFTPAY_API_KEY
        })
      });

      providerHttpStatus = swiftpayRes.status;
      providerRawText = await swiftpayRes.text();
      try {
        providerData = JSON.parse(providerRawText);
      } catch (e) {
        providerData = null;
      }
    } catch (e) {
      console.error('SwiftPay status polling error:', e);
    }

    if (debug) {
      console.log('SwiftPay verification response:', {
        checkoutId,
        providerHttpStatus,
        providerData,
        providerRawText
      });
    }

    const resultContainer =
      providerData?.result ||
      providerData?.data?.result ||
      providerData?.payment ||
      providerData?.data?.payment;

    const providerStatus = String(providerData?.status || resultContainer?.status || '').toLowerCase();
    const resultCode = resultContainer?.resultCode != null ? String(resultContainer.resultCode) : null;
    const resultDesc = resultContainer?.resultDesc != null ? String(resultContainer.resultDesc) : null;
    const mpesaReceiptNumber =
      resultContainer?.mpesaReceiptNumber != null ? String(resultContainer.mpesaReceiptNumber) : null;

    // Determine if we can finalize
    let finalDbStatus = 'pending';
    // SwiftPay's top-level `status` can vary; `resultCode` is authoritative when present.
    if (resultCode === '0') {
      finalDbStatus = 'success';
    } else if (resultCode != null && resultCode !== '0') {
      finalDbStatus = 'failed';
    } else if (providerStatus === 'success' && !resultCode) {
      // Defensive: if provider says success but doesn't include a result code, keep pending.
      finalDbStatus = 'pending';
    }

    // Persist any provider result (only if we have a transaction row already)
    if (transaction && finalDbStatus !== 'pending') {
      try {
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: finalDbStatus,
            mpesa_receipt_number: mpesaReceiptNumber,
            result_desc: resultDesc,
            result_code: resultCode
          })
          .eq('checkout_request_id', transaction.checkout_request_id);

        if (updateError) {
          console.error('Database update error:', updateError);
        }
      } catch (dbUpdateErr) {
        console.error('Database update exception:', dbUpdateErr);
      }
    }

    // If there is no record, we still report best-effort based on provider response
    if (finalDbStatus === 'success') {
      return res.status(200).json({
        success: true,
        payment: {
          status: 'SUCCESS',
          amount: transaction?.amount,
          phoneNumber: transaction?.phone,
          mpesaReceiptNumber,
          resultDesc,
          resultCode,
          timestamp: transaction?.updated_at
        }
      });
    }

    if (finalDbStatus === 'failed') {
      return res.status(200).json({
        success: true,
        payment: {
          status: 'FAILED',
          amount: transaction?.amount,
          phoneNumber: transaction?.phone,
          mpesaReceiptNumber,
          resultDesc,
          resultCode,
          timestamp: transaction?.updated_at
        }
      });
    }

    // Still pending
    return res.status(200).json({
      success: true,
      payment: {
        status: 'PENDING',
        amount: transaction?.amount,
        phoneNumber: transaction?.phone_number,
        message: 'Payment is still being processed',
        ...(debug
          ? {
              providerHttpStatus,
              providerData,
              providerRawText
            }
          : {})
      }
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
      error: error.message || String(error)
    });
  }
};
