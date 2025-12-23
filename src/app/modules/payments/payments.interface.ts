// src/types/payment.types.ts

export interface CreateSessionRequest {
  authenticationLimit?: number;
}

export interface CreateSessionResponse {
  session: {
    id: string;
    authenticationLimit: number;
    aes256Key: string;
    version: string;
    updateStatus: string;
  };
}

export interface UpdateSessionRequest {
  order: {
    amount: number;
    currency: string;
  };
}

export interface PaymentRequest {
  userId: string;
  sessionId: string;
  amount: number;
  currency: string;
  description?: string;
  orderId?: string;
}

// src/interfaces/payments.interface.ts

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  gatewayCode?: string;
  message?: string;
  error?: string;
  require3DS?: boolean;
  redirectHtml?: string;
}

export interface PaymentHistory {
  id: string;
  userId: string;
  transactionId: string;
  orderId: string;
  sessionId: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  gatewayCode?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GatewayPaymentRequest {
  apiOperation: string;
  order: {
    amount: number;
    currency: string;
    id: string;
  };
  sourceOfFunds: {
    type: 'CARD';
  };
  session: {
    id: string;
  };
  transaction?: {
    reference?: string;
  };
}

export interface GatewayPaymentResponse {
  result: 'SUCCESS' | 'FAILURE' | 'PENDING';
  transaction: {
    id: string;
    amount: number;
    currency: string;
  };
  order: {
    id: string;
    status: string;
  };
  response: {
    gatewayCode: string;
  };
}