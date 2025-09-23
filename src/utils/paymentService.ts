// Working STK Push payment service from genesis verification project
export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: {
    externalReference: string;
    checkoutRequestId: string;
  };
  error?: string;
}

export interface PaymentStatus {
  success: boolean;
  payment?: {
    status: string;
    amount: number;
    phoneNumber: string;
    mpesaReceiptNumber?: string;
    resultDesc?: string;
  };
  message?: string;
  error?: string;
}

// Format phone number for Kenyan format
export function formatPhoneNumber(input: string): string {
  // Remove non-digit characters and spaces
  let cleaned = input.replace(/\D/g, '');
  
  // Format for Kenya number
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  
  return cleaned;
}

// Validate Kenyan phone number
export function validatePhoneNumber(phoneNumber: string): boolean {
  const formatted = formatPhoneNumber(phoneNumber);
  return formatted.length === 12 && formatted.startsWith('254');
}

// Initiate STK Push payment using working genesis functions
export async function initiatePayment(
  phoneNumber: string,
  amount: number = 20,
  description: string = 'Account Activation Fee'
): Promise<PaymentResponse> {
  try {
    const cleanPhone = formatPhoneNumber(phoneNumber);
    
    const response = await fetch('/.netlify/functions/initiate-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: cleanPhone,
        amount,
        description
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Payment initiation error:', error);
    return {
      success: false,
      message: 'Network error. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Check payment status using working genesis functions
export async function checkPaymentStatus(reference: string): Promise<PaymentStatus> {
  try {
    const response = await fetch(`/.netlify/functions/payment-status/${reference}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Payment status check error:', error);
    return {
      success: false,
      message: 'Failed to check payment status',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Poll payment status with same logic as genesis verification
export function pollPaymentStatus(
  reference: string,
  onStatusUpdate: (status: PaymentStatus) => void,
  maxAttempts: number = 50,
  intervalMs: number = 500
): () => void {
  let attempts = 0;
  
  const poll = async () => {
    attempts++;
    
    try {
      const status = await checkPaymentStatus(reference);
      onStatusUpdate(status);
      
      // Stop polling if payment is complete or failed
      if (status.success && status.payment) {
        if (status.payment.status === 'SUCCESS' || status.payment.status === 'FAILED') {
          clearTimeout(timeout);
          return;
        }
      }
      
      // Continue polling if still pending
      if (attempts < maxAttempts) {
        timeout = setTimeout(poll, intervalMs);
      } else {
        onStatusUpdate({
          success: false,
          message: 'Payment timeout - please try again'
        });
      }
    } catch (error) {
      console.error('Polling error:', error);
      onStatusUpdate({
        success: false,
        message: 'Payment verification failed'
      });
    }
  };
  
  let timeout = setTimeout(poll, intervalMs);
  
  // Return cleanup function
  return () => clearTimeout(timeout);
}
