import axios from 'axios';

interface CartItem {
  weight: number;
  length: number;
  width: number;
  height: number;
}

interface ShippingCalculationRequest {
  cartItems: CartItem[];
  destinationCity: string;
  destinationCountry: string;
  destinationAddress: string;
  destinationPostCode: string;
}

interface ShippingRate {
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

// Aramex Configuration
const ARAMEX_CONFIG = {
  baseUrl: process.env.ARAMEX_BASE_URL || 'https://ws.aramex.net/shippingapi.v2',
  username: process.env.ARAMEX_USERNAME || 'fahad@mditems.com',
  password: process.env.ARAMEX_PASSWORD || 'Mditems@12345$',
  accountNumber: process.env.ARAMEX_ACCOUNT_NUMBER || '72098791',
  accountPin: process.env.ARAMEX_ACCOUNT_PIN || '398604',
  accountEntity: process.env.ARAMEX_ACCOUNT_ENTITY || 'BAH',
  accountCountryCode: process.env.ARAMEX_ACCOUNT_COUNTRY_CODE || 'BH'
};

const ARAMEX_PROVIDER_ID = '6902ded28dc8ab84fb8481ee';

// Helper Functions
const calculateDimWeight = (length: number, width: number, height: number): number => {
  return (length * width * height) / 5000;
};

const calculateTotalPackageDetails = (cartItems: CartItem[]) => {
  let totalActualWeight = 0;
  let totalVolume = 0;
  
  cartItems.forEach(item => {
    totalActualWeight += item.weight;
    totalVolume += (item.length * item.width * item.height);
  });
  
  const avgLength = Math.max(...cartItems.map(i => i.length));
  const avgWidth = Math.max(...cartItems.map(i => i.width));
  const avgHeight = cartItems.reduce((sum, i) => sum + i.height, 0);
  
  const totalDimWeight = calculateDimWeight(avgLength, avgWidth, avgHeight);
  const chargeableWeight = Math.max(totalActualWeight, totalDimWeight);
  
  return {
    actualWeight: totalActualWeight,
    chargeableWeight,
    length: avgLength,
    width: avgWidth,
    height: avgHeight
  };
};

const getCountryCode = (country: string): string => {
  const countryMap: { [key: string]: string } = {
    'Bahrain': 'BH',
    'Saudi Arabia': 'SA',
    'UAE': 'AE',
    'United Arab Emirates': 'AE',
    'Kuwait': 'KW',
    'Oman': 'OM',
    'Qatar': 'QA'
  };
  return countryMap[country] || 'BH';
};

const getProductType = (country: string): { productGroup: string; productType: string } => {
  if (country === 'Bahrain') {
    return {
      productGroup: 'DOM',
      productType: 'OND'
    };
  } else {
    return {
      productGroup: 'EXP',
      productType: 'PDX'
    };
  }
};

// Helper to parse address into multiple lines
const parseAddress = (address: string): { line1: string; line2: string; line3: string } => {
  const parts = address.split(',').map(part => part.trim()).filter(part => part.length > 0);
  
  return {
    line1: parts[0] || 'N/A',
    line2: parts[1] || 'N/A',
    line3: parts[2] || 'N/A'
  };
};

// Main shipping rate calculation function
export const calculateAramexShippingRate = async (
  params: ShippingCalculationRequest
): Promise<any> => {
  const { cartItems, destinationCity, destinationCountry, destinationAddress, destinationPostCode } = params;
  
  if (!cartItems || cartItems.length === 0) {
    throw new Error('No cart items provided');
  }

  if (!destinationPostCode) {
    throw new Error('Destination postal code is required');
  }
  
  const packageDetails = calculateTotalPackageDetails(cartItems);
  const countryCode = getCountryCode(destinationCountry);
  const { productGroup, productType } = getProductType(destinationCountry);
  const addressLines = parseAddress(destinationAddress);
  
  try {
    const requestBody = {
      ClientInfo: {
        UserName: ARAMEX_CONFIG.username,
        Password: ARAMEX_CONFIG.password,
        Version: 'v1.0',
        AccountNumber: ARAMEX_CONFIG.accountNumber,
        AccountPin: ARAMEX_CONFIG.accountPin,
        AccountEntity: ARAMEX_CONFIG.accountEntity,
        AccountCountryCode: ARAMEX_CONFIG.accountCountryCode
      },
      OriginAddress: {
        Line1: 'Building 100',
        Line2: 'Road 200',
        Line3: 'Block 301',
        City: 'Manama',
        PostCode: '123',
        CountryCode: 'BH'
      },
      DestinationAddress: {
        Line1: addressLines.line1,
        Line2: addressLines.line2,
        Line3: addressLines.line3,
        City: destinationCity,
        PostCode: destinationPostCode,
        CountryCode: countryCode
      },
      ShipmentDetails: {
        DescriptionOfGoods: 'General Goods',
        GoodsOriginCountry: 'BH',
        PaymentOptions: '',
        ActualWeight: {
          Value: packageDetails.actualWeight.toString(),
          Unit: 'KG'
        },
        ChargeableWeight: {
          Value: packageDetails.chargeableWeight.toString(),
          Unit: 'KG'
        },
        NumberOfPieces: cartItems.length,
        PaymentType: 'P',
        ProductGroup: productGroup,
        ProductType: productType,
        Dimensions: {
          Length: packageDetails.length.toString(),
          Width: packageDetails.width.toString(),
          Height: packageDetails.height.toString(),
          Unit: 'CM'
        }
      },
      PreferredCurrencyCode: 'BHD'
    };

    console.log('Aramex Request:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post(
      `${ARAMEX_CONFIG.baseUrl}/RateCalculator/Service_1_0.svc/json/CalculateRate`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const data = response.data;
    console.log('Aramex Response:', JSON.stringify(data, null, 2));
    
    if (data.HasErrors) {
      console.error('Aramex API Error:', data.Notifications);
      throw new Error('Aramex rate calculation failed');
    }

    const totalAmount = data.TotalAmount?.Value;

    return {
      provider: 'aramex',
      name: 'Aramex',
      logo: '📦',
      price: parseFloat(totalAmount),
      currency: 'BHD',
      deliveryDays: destinationCountry === 'Bahrain' ? '2-3' : '4-6',
      description: destinationCountry === 'Bahrain' 
        ? 'Domestic express courier service' 
        : 'International express courier service',
      serviceType: destinationCountry === 'Bahrain' ? 'Domestic Express' : 'International Express',
      chargeableWeight: packageDetails.chargeableWeight,
      providerId: ARAMEX_PROVIDER_ID
    };
  } catch (error) {
    console.error('Error fetching Aramex rates:', error);
    throw error;
  }
};