// src/types/checkout.types.ts

export interface MerchantInfo {
  name: string;
  url?: string;
}

export interface OrderDetails {
  id: string;
  currency: string;
  amount: string;
  description?: string;
}

export interface InteractionConfig {
  operation: 'AUTHORIZE' | 'PURCHASE' | 'VERIFY';
  merchant?: MerchantInfo;
  returnUrl?: string;
  redirectMerchantUrl?: string;
  retryAttemptCount?: number;
  displayControl?: {
    billingAddress?: 'HIDE' | 'MANDATORY' | 'OPTIONAL' | 'READ_ONLY';
    customerEmail?: 'HIDE' | 'MANDATORY' | 'OPTIONAL' | 'READ_ONLY';
    shipping?: 'HIDE' | 'READ_ONLY';
  };
  locale?: string;
}

export interface InitiateCheckoutRequest {
  apiOperation: 'INITIATE_CHECKOUT';
  checkoutMode?: 'WEBSITE';
  interaction: InteractionConfig;
  order: OrderDetails;
}

export interface InitiateCheckoutResponse {
  merchant: string;
  result: string;
  session: {
    id: string;
    updateStatus: string;
    version: string;
  };
  successIndicator: string;
}

export interface TransactionResult {
  orderId: string;
  resultIndicator: string;
  sessionId: string;
  isSuccess: boolean;
}

export interface RetrieveOrderResponse {
  merchant: string;
  order: {
    id: string;
    amount: string;
    currency: string;
    description?: string;
    status: string;
    totalAuthorizedAmount?: string;
    totalCapturedAmount?: string;
    totalRefundedAmount?: string;
  };
  result: string;
  transaction?: Array<{
    id: string;
    type: string;
    amount: string;
    currency: string;
  }>;
}

export interface CaptureRequest {
  orderId: string;
  transactionId: string;
  amount?: string;
  currency?: string;
}

export interface RefundRequest {
  orderId: string;
  transactionId: string;
  amount?: string;
  currency?: string;
}

export interface VoidRequest {
  orderId: string;
  transactionId: string;
}