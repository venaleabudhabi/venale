import crypto from 'crypto';
import { paymentConfig, isDemoMode } from '../config/payment';

export interface PaymentRequest {
  amount: number; // in fils (1 AED = 100 fils)
  currency: string; // 'AED'
  orderNumber: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl: string;
  paymentMethod: 'APPLE_PAY' | 'GOOGLE_PAY' | 'CARD';
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  paymentUrl?: string; // For redirect-based payments
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  message?: string;
  cardLast4?: string;
  cardBrand?: string;
  rawResponse?: any;
}

/**
 * MOCK ADCB Payment Service
 * 
 * This is a simulation of ADCB payment gateway integration.
 * Replace the methods in this file with actual ADCB API calls for production.
 * 
 * Current behavior (DEMO MODE):
 * - Simulates successful payments after 2 seconds
 * - Generates mock transaction IDs
 * - No actual payment processing
 * 
 * For PRODUCTION:
 * - Replace with ADCB SDK/API calls
 * - Use real ADCB_MERCHANT_ID, ADCB_ACCESS_CODE, ADCB_SECURE_HASH
 * - Implement proper signature generation
 * - Handle real ADCB callbacks
 */
class ADCBPaymentService {
  
  /**
   * Initialize payment with ADCB
   * 
   * DEMO: Returns mock success immediately
   * PRODUCTION: Should call ADCB API to create payment session
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (isDemoMode()) {
      return this.mockInitiatePayment(request);
    }
    
    // TODO: Replace with actual ADCB API call
    // Example:
    // const signature = this.generateSignature(request);
    // const response = await axios.post(paymentConfig.adcb.gatewayUrl + '/initiate', {
    //   merchant_identifier: paymentConfig.adcb.merchantId,
    //   access_code: paymentConfig.adcb.accessCode,
    //   amount: request.amount,
    //   currency: request.currency,
    //   merchant_reference: request.orderNumber,
    //   signature: signature,
    //   ...
    // });
    
    throw new Error('Production ADCB integration not yet implemented. Set ADCB_MODE=demo or implement production logic.');
  }

  /**
   * Verify payment callback from ADCB
   * 
   * DEMO: Returns mock success
   * PRODUCTION: Should verify ADCB signature and payment status
   */
  async verifyPayment(transactionId: string, signature?: string): Promise<PaymentResponse> {
    if (isDemoMode()) {
      return this.mockVerifyPayment(transactionId);
    }
    
    // TODO: Replace with actual ADCB verification
    // Example:
    // const response = await axios.post(paymentConfig.adcb.gatewayUrl + '/verify', {
    //   merchant_identifier: paymentConfig.adcb.merchantId,
    //   access_code: paymentConfig.adcb.accessCode,
    //   transaction_id: transactionId,
    //   signature: signature,
    // });
    
    throw new Error('Production ADCB verification not yet implemented. Set ADCB_MODE=demo or implement production logic.');
  }

  /**
   * Process Apple Pay payment
   * 
   * DEMO: Simulates successful Apple Pay
   * PRODUCTION: Should process with ADCB Apple Pay API
   */
  async processApplePay(request: PaymentRequest): Promise<PaymentResponse> {
    if (isDemoMode()) {
      // Simulate Apple Pay processing
      await this.delay(2000); // Simulate network delay
      
      return {
        success: true,
        transactionId: this.generateMockTransactionId('APPLE'),
        status: 'SUCCESS',
        message: 'Apple Pay payment successful (DEMO)',
        // Apple Pay doesn't expose card details
      };
    }
    
    // TODO: Implement real ADCB Apple Pay processing
    throw new Error('Production Apple Pay not yet implemented.');
  }

  /**
   * Process Google Pay payment
   * 
   * DEMO: Simulates successful Google Pay
   * PRODUCTION: Should process with ADCB Google Pay API
   */
  async processGooglePay(request: PaymentRequest): Promise<PaymentResponse> {
    if (isDemoMode()) {
      // Simulate Google Pay processing
      await this.delay(2000); // Simulate network delay
      
      // Mock card details (Google Pay provides last 4 digits)
      const mockCards = [
        { last4: '4242', brand: 'Visa' },
        { last4: '5555', brand: 'Mastercard' },
        { last4: '3782', brand: 'Amex' },
      ];
      const randomCard = mockCards[Math.floor(Math.random() * mockCards.length)];
      
      return {
        success: true,
        transactionId: this.generateMockTransactionId('GOOGLE'),
        status: 'SUCCESS',
        message: 'Google Pay payment successful (DEMO)',
        cardLast4: randomCard.last4,
        cardBrand: randomCard.brand,
      };
    }
    
    // TODO: Implement real ADCB Google Pay processing
    throw new Error('Production Google Pay not yet implemented.');
  }

  /**
   * Generate ADCB signature for API requests
   * This is required for production ADCB integration
   */
  private generateSignature(data: any): string {
    // PRODUCTION IMPLEMENTATION NEEDED
    // Example ADCB signature generation (verify with ADCB documentation):
    // const signatureString = `${data.merchant_identifier}${data.access_code}${data.amount}${data.currency}${paymentConfig.adcb.secureHash}`;
    // return crypto.createHash('sha256').update(signatureString).digest('hex');
    
    return 'MOCK_SIGNATURE_' + Date.now();
  }

  // ==================== MOCK/DEMO METHODS ====================
  // These simulate payment gateway behavior for development
  // Remove or disable when switching to production
  
  private async mockInitiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    await this.delay(1000);
    
    return {
      success: true,
      transactionId: this.generateMockTransactionId('INIT'),
      status: 'PENDING',
      message: 'Payment initiated (DEMO MODE)',
      rawResponse: {
        demo: true,
        merchantId: paymentConfig.adcb.merchantId,
        amount: request.amount,
        orderNumber: request.orderNumber,
      },
    };
  }

  private async mockVerifyPayment(transactionId: string): Promise<PaymentResponse> {
    await this.delay(500);
    
    return {
      success: true,
      transactionId: transactionId,
      status: 'SUCCESS',
      message: 'Payment verified (DEMO MODE)',
    };
  }

  private generateMockTransactionId(prefix: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_TXN_${timestamp}_${random}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const adcbService = new ADCBPaymentService();
