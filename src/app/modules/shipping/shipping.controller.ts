import { Request, Response } from 'express';
import { calculateAramexShippingRate } from './aramexShipping.service';

export const calculateShippingRate = async (req: Request, res: Response) => {
  try {
    const { cartItems, destinationCity, destinationCountry, destinationAddress, destinationPostCode } = req.body;

    // Validation
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart items are required'
      });
    }

    if (!destinationCountry) {
      return res.status(400).json({
        success: false,
        error: 'Destination country is required'
      });
    }

    if (!destinationCity) {
      return res.status(400).json({
        success: false,
        error: 'Destination city is required'
      });
    }

    if (!destinationAddress) {
      return res.status(400).json({
        success: false,
        error: 'Destination address is required'
      });
    }

    if (!destinationPostCode) {
      return res.status(400).json({
        success: false,
        error: 'Destination postal code is required'
      });
    }

    // Validate cart items structure
    const isValid = cartItems.every(item => 
      typeof item.weight === 'number' &&
      typeof item.length === 'number' &&
      typeof item.width === 'number' &&
      typeof item.height === 'number'
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid cart item structure. Each item must have weight, length, width, and height'
      });
    }

    // Calculate shipping rate
    const shippingRate = await calculateAramexShippingRate({
      cartItems,
      destinationCity,
      destinationCountry,
      destinationAddress,
      destinationPostCode
    });

    res.json({
      success: true,
      data: shippingRate
    });

  } catch (error) {
    console.error('Shipping calculation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
};