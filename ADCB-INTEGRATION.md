# ADCB Payment Gateway Integration Guide

## Current Status: DEMO MODE ✅

The payment system is currently running in **DEMO MODE** with mock payment processing. This allows you to test the complete payment flow without real transactions.

---

## 🚀 How to Switch to Production

Follow these steps when you're ready to go live with real ADCB payments.

### Step 1: Get ADCB Credentials

Contact ADCB and obtain your production credentials:

- ✅ **Merchant ID** - Your unique ADCB merchant identifier
- ✅ **Access Code** - API access code for authentication
- ✅ **Secure Hash Secret** - Secret key for generating payment signatures
- ✅ **Gateway URL** - Production ADCB gateway endpoint
- ✅ **Apple Pay Merchant ID** - For Apple Pay integration
- ✅ **Google Pay Merchant ID** - For Google Pay integration

### Step 2: Update Environment Variables

Edit `/backend/.env` and replace the DEMO values:

```env
# BEFORE (Demo)
ADCB_MERCHANT_ID=DEMO_MERCHANT_123456
ADCB_ACCESS_CODE=DEMO_ACCESS_CODE_ABC
ADCB_SECURE_HASH=DEMO_SECRET_HASH_XYZ_CHANGE_IN_PRODUCTION
ADCB_GATEWAY_URL=https://demo-payment-gateway.adcb.com
ADCB_MODE=demo

# AFTER (Production)
ADCB_MERCHANT_ID=your_real_merchant_id_from_adcb
ADCB_ACCESS_CODE=your_real_access_code_from_adcb
ADCB_SECURE_HASH=your_real_secure_hash_from_adcb
ADCB_GATEWAY_URL=https://payment-gateway.adcb.com
ADCB_MODE=production
```

**⚠️ IMPORTANT:** Keep these credentials SECRET. Never commit them to git!

### Step 3: Implement Real ADCB API Calls

Update `/backend/src/services/adcb.service.ts`:

The file currently has mock implementations. Replace these methods:

#### 3.1 Update `initiatePayment()` Method

```typescript
async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
  if (isDemoMode()) {
    return this.mockInitiatePayment(request);
  }
  
  // PRODUCTION CODE - Replace with actual ADCB API call
  const signature = this.generateSignature({
    merchant_identifier: paymentConfig.adcb.merchantId,
    access_code: paymentConfig.adcb.accessCode,
    amount: request.amount,
    currency: request.currency,
    merchant_reference: request.orderNumber,
  });

  const response = await axios.post(
    `${paymentConfig.adcb.gatewayUrl}/initiate`,
    {
      merchant_identifier: paymentConfig.adcb.merchantId,
      access_code: paymentConfig.adcb.accessCode,
      amount: request.amount,
      currency: request.currency,
      merchant_reference: request.orderNumber,
      return_url: request.returnUrl,
      signature: signature,
      // Add other ADCB required fields based on their documentation
    }
  );

  return {
    success: response.data.success,
    transactionId: response.data.transaction_id,
    paymentUrl: response.data.payment_url,
    status: response.data.status,
  };
}
```

#### 3.2 Update `processApplePay()` Method

```typescript
async processApplePay(request: PaymentRequest): Promise<PaymentResponse> {
  if (isDemoMode()) {
    await this.delay(2000);
    return {
      success: true,
      transactionId: this.generateMockTransactionId('APPLE'),
      status: 'SUCCESS',
      message: 'Apple Pay payment successful (DEMO)',
    };
  }
  
  // PRODUCTION CODE - Replace with actual ADCB Apple Pay API
  const response = await axios.post(
    `${paymentConfig.adcb.gatewayUrl}/apple-pay`,
    {
      merchant_identifier: paymentConfig.adcb.merchantId,
      access_code: paymentConfig.adcb.accessCode,
      amount: request.amount,
      currency: request.currency,
      merchant_reference: request.orderNumber,
      // Apple Pay specific fields from ADCB documentation
    }
  );

  return {
    success: response.data.success,
    transactionId: response.data.transaction_id,
    status: response.data.status,
  };
}
```

#### 3.3 Update `processGooglePay()` Method

Similar to Apple Pay, implement the real ADCB Google Pay API call.

#### 3.4 Update `generateSignature()` Method

```typescript
private generateSignature(data: any): string {
  // Consult ADCB documentation for exact signature algorithm
  // Example (verify with ADCB):
  const signatureString = `${data.merchant_identifier}${data.access_code}${data.amount}${data.currency}${paymentConfig.adcb.secureHash}`;
  return crypto.createHash('sha256').update(signatureString).digest('hex');
}
```

### Step 4: Test in ADCB Sandbox

ADCB provides a test/sandbox environment:

1. Set `ADCB_MODE=demo`
2. Use ADCB sandbox credentials
3. Use ADCB sandbox gateway URL
4. Test all payment flows
5. Verify callbacks and webhooks

### Step 5: Domain Verification (Apple Pay)

For Apple Pay to work:

1. Download Apple Pay domain verification file from ADCB
2. Place it at: `frontend/public/.well-known/apple-developer-merchantid-domain-association`
3. Ensure it's accessible at: `https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association`

### Step 6: Configure Webhooks

Set up ADCB webhooks to notify your backend:

1. In ADCB merchant portal, set webhook URL to:
   ```
   https://yourdomain.com/api/payments/verify
   ```

2. ADCB will POST payment status to this endpoint

3. Your backend will verify and update order status

### Step 7: SSL/HTTPS Required

Apple Pay and Google Pay ONLY work on HTTPS:

- ✅ Deploy to production server with SSL certificate
- ✅ Use https:// URLs
- ❌ Will NOT work on http://localhost (except in demo mode)

### Step 8: Go Live Checklist

Before switching `ADCB_MODE=production`:

- [ ] Obtained real ADCB production credentials
- [ ] Updated all credentials in .env
- [ ] Implemented real ADCB API calls in adcb.service.ts
- [ ] Tested in ADCB sandbox environment
- [ ] Verified Apple Pay domain
- [ ] Configured webhooks
- [ ] Deployed to HTTPS server
- [ ] Tested small transaction in production
- [ ] Monitored logs for any errors
- [ ] Set up payment reconciliation process

---

## 🧪 Testing in Demo Mode

Current demo behavior:

### Apple Pay (Mock)
- Click "Apple Pay" button
- Simulates 2-second payment processing
- Auto-succeeds with mock transaction ID
- Order status: CONFIRMED
- No real money charged

### Google Pay (Mock)
- Click "Google Pay" button
- Simulates 2-second payment processing
- Auto-succeeds with mock transaction ID
- Order status: CONFIRMED
- No real money charged

### Cash on Delivery
- Works in both demo and production
- No payment processing needed
- Order status: PENDING until delivery

---

## 📋 ADCB Documentation Resources

Request these from ADCB:

1. **API Integration Guide** - Technical documentation for API calls
2. **Signature Generation Guide** - How to create secure signatures
3. **Apple Pay Integration Guide** - Specific steps for Apple Pay
4. **Google Pay Integration Guide** - Specific steps for Google Pay
5. **Webhook Specification** - Format of webhook callbacks
6. **Test Credentials** - Sandbox credentials for testing
7. **Error Codes Reference** - List of possible errors and meanings

---

## 🔒 Security Checklist

- [ ] Never commit ADCB credentials to git
- [ ] Use environment variables for all secrets
- [ ] Implement signature verification for webhooks
- [ ] Validate payment amounts match order totals
- [ ] Log all payment transactions
- [ ] Set up monitoring and alerts
- [ ] Implement fraud detection rules
- [ ] Regular security audits
- [ ] PCI DSS compliance (if storing card data)

---

## 🐛 Troubleshooting

### Payment fails in production

1. Check `ADCB_MODE` is set to `production`
2. Verify all credentials are correct
3. Check ADCB gateway URL is production URL
4. Review backend logs for API errors
5. Verify signature generation matches ADCB specs

### Apple Pay button doesn't appear

1. Ensure page is served over HTTPS
2. Verify Apple Pay domain verification file exists
3. Check browser console for errors
4. Confirm Apple Pay is enabled in ADCB merchant portal

### Google Pay button doesn't appear

1. Ensure page is served over HTTPS
2. Check browser console for errors
3. Verify Google Pay is enabled in ADCB merchant portal

### Webhooks not received

1. Verify webhook URL is publicly accessible
2. Check webhook URL in ADCB merchant portal
3. Review server logs for incoming requests
4. Ensure /api/payments/verify endpoint is working

---

## 📞 Support

- **ADCB Support**: Contact your ADCB account manager
- **Technical Issues**: Check ADCB developer documentation
- **Integration Help**: Consult ADCB technical support team

---

## 📝 Change Log

### When Switching from Demo to Production

Files that need updates:

1. `/backend/.env` - Update credentials and set `ADCB_MODE=production`
2. `/backend/src/services/adcb.service.ts` - Implement real API calls
3. `/frontend/public/.well-known/` - Add Apple Pay domain verification

Everything else stays the same! The UI and flow are already built.

---

**Current Status:** ✅ Demo Mode - Safe to test, no real payments

**Next Step:** Get ADCB production credentials and follow Step 1 above.
