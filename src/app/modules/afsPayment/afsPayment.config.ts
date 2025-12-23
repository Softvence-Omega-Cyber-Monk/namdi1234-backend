// src/config/checkout.config.ts

export const checkoutConfig = {
  // Gateway configuration
  gateway: {
    baseUrl: process.env.GATEWAY_BASE_URL || 'https://afs.gateway.mastercard.com',
    apiVersion: process.env.API_VERSION || '100',
  },
  
  // Merchant credentials
  merchant: {
    id: process.env.MERCHANT_ID || '',
    password: process.env.MERCHANT_PASSWORD || '',
    name: process.env.MERCHANT_NAME || 'Your Store',
    url: process.env.MERCHANT_URL || 'https://yourstore.com',
  },
  
  // Checkout settings
  checkout: {
    defaultCurrency: process.env.DEFAULT_CURRENCY || 'USD',
    // Changed to callback endpoint instead of success page
    returnUrl: process.env.CHECKOUT_RETURN_URL || 'http://localhost:3000/api/checkout/callback',
    redirectMerchantUrl: process.env.REDIRECT_MERCHANT_URL || 'http://localhost:3000/api/checkout/callback',
    retryAttemptCount: parseInt(process.env.RETRY_ATTEMPT_COUNT || '3'),
  },
};

// Generate Basic Auth header
export const getAuthHeader = (): string => {
  const credentials = `merchant.${checkoutConfig.merchant.id}:${checkoutConfig.merchant.password}`;
  const encodedCredentials = Buffer.from(credentials).toString('base64');
  return `Basic ${encodedCredentials}`;
};

// Generate API endpoint
export const getApiEndpoint = (path: string): string => {
  return `${checkoutConfig.gateway.baseUrl}/api/rest/version/${checkoutConfig.gateway.apiVersion}/merchant/${checkoutConfig.merchant.id}${path}`;
};