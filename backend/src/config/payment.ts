export const paymentConfig = {
  adcb: {
    merchantId: process.env.ADCB_MERCHANT_ID || '',
    accessCode: process.env.ADCB_ACCESS_CODE || '',
    secureHash: process.env.ADCB_SECURE_HASH || '',
    gatewayUrl: process.env.ADCB_GATEWAY_URL || '',
    mode: process.env.ADCB_MODE || 'demo', // 'demo' or 'production'
  },
  
  // Payment methods available
  methods: {
    applePay: {
      enabled: true,
      name: 'Apple Pay',
      icon: '🍎',
    },
    googlePay: {
      enabled: true,
      name: 'Google Pay',
      icon: 'G',
    },
    cod: {
      enabled: true,
      name: 'Cash on Delivery',
      icon: '💵',
    },
  },
};

export const isProductionMode = () => {
  return paymentConfig.adcb.mode === 'production';
};

export const isDemoMode = () => {
  return paymentConfig.adcb.mode === 'demo';
};
