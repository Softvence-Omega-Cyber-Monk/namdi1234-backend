export interface CartItem {
  weight: number;
  length: number;
  width: number;
  height: number;
}

export interface ShippingCalculationRequest {
  cartItems: CartItem[];
  destinationCity: string;
  destinationCountry: string;
  destinationAddress: string;
}

export interface ShippingRate {
  provider: 'aramex';
  name: string;
  logo: string;
  price: number;
  currency: string;
  deliveryDays: string;
  description: string;
  serviceType: string;
  chargeableWeight: number;
  providerId: string;
}