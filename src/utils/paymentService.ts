// Payment service for STK Push integration
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
  // Remove non-digit characters
  let cleaned = input.replace(/\D/g, '');
  
  // Format for Kenya number
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  }
  
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  
  return cleaned;
}

// Validate Kenyan phone number
export function validatePhoneNumber(phoneNumber: string): boolean {
  const formatted = formatPhoneNumber(phoneNumber);
  return formatted.length === 12 && formatted.startsWith('254');
}

// Get API URL based on environment
const getApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' 
      ? 'http://localhost:8888/.netlify/functions'
      : `${window.location.origin}/.netlify/functions`;
  }
  return '/.netlify/functions';
};

// Initiate STK Push payment (can be used for both payments and withdrawals)
export async function initiatePayment(
  phoneNumber: string,
  amount: number = 150,
  description: string = 'EarnSpark Transaction'
): Promise<PaymentResponse> {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    const response = await fetch(`${getApiUrl()}/initiate-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber: formattedPhone,
        userId: 'user-' + Date.now(),
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

// Check payment status
export async function checkPaymentStatus(reference: string): Promise<PaymentStatus> {
  try {
    const response = await fetch(`${getApiUrl()}/payment-status/${reference}`);
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

// Poll payment status until completion
export function pollPaymentStatus(
  reference: string,
  onStatusUpdate: (status: PaymentStatus) => void,
  maxAttempts: number = 60,
  intervalMs: number = 3000
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
          clearInterval(interval);
          return;
        }
      }
      
      // Stop polling after max attempts
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        onStatusUpdate({
          success: false,
          message: 'Payment status check timed out'
        });
      }
    } catch (error) {
      console.error('Polling error:', error);
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        onStatusUpdate({
          success: false,
          message: 'Payment status check failed'
        });
      }
    }
  };
  
  const interval = setInterval(poll, intervalMs);
  
  // Return cleanup function
  return () => clearInterval(interval);
}
