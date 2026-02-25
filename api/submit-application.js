import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

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
    const { 
      phone,
      amount,
      paymentReference
    } = req.body;

    // Validate required fields
    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required field: phone' 
      });
    }

    // Prepare project-specific data
    const projectData = {
      activationFee: amount || 125,
      submittedAt: new Date().toISOString()
    };

    // Get client IP and user agent
    const ipAddress = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // Insert into applications table
    const { data, error } = await supabase
      .from('applications')
      .insert({
        project_name: 'survaymurder',
        full_name: 'Survey User',
        email: 'survey@application.com',
        phone: phone,
        project_data: projectData,
        payment_reference: paymentReference || null,
        payment_status: 'unpaid',
        payment_amount: amount || 125,
        ip_address: ipAddress.split(',')[0].trim(),
        user_agent: userAgent
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save application',
        error: error.message 
      });
    }

    console.log('Application saved successfully:', data.id);

    return res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: data.id,
        reference: data.payment_reference
      }
    });

  } catch (error) {
    console.error('Submit application error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
