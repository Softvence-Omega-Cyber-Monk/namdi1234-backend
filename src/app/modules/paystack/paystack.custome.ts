// controllers/payment.controller.ts
import { Request, Response } from 'express';
import { ProductModel } from '../products/product.model';
import Order from '../order/order.model';
import { UserModel } from '../users/user.model';
import paystack from './paystack.utils';

// Assume 10% platform commission
const PLATFORM_COMMISSION_PERCENT = 10;

export const initializePayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('products.productId');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Get vendor from first product (assuming single-vendor order)
    // For multi-vendor, you'd need a more complex split logic
    const firstProduct = order.products[0];
    const product = await  ProductModel.findById(firstProduct.productId);
    if (!product) return res.status(400).json({ message: 'Invalid product' });

    const vendor = await UserModel.findById(product.userId);
    if (!vendor || !vendor.paystackSubaccountCode) {
      return res.status(400).json({ message: 'Vendor subaccount not ready' });
    }

    // Amount in **kobo** (Paystack uses smallest currency unit)
    const amountInKobo = Math.round(order.grandTotal * 100);

    // Vendor share = 90%, platform = 10%
    const vendorSharePercent = 100 - PLATFORM_COMMISSION_PERCENT;

    const customer = await UserModel.findById(order.userId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const payload = {
      email: customer.email,
      amount: amountInKobo,
      reference: order.orderNumber, // Use orderNumber as reference
      callback_url: `${process.env.FRONTEND_URL}/payment/success?order=${order.orderNumber}`,
      split: {
        type: 'percentage',
        subaccounts: [
          {
            subaccount: vendor.paystackSubaccountCode,
            share: vendorSharePercent,
          },
        ],
      },
    };

    const response = await paystack.post('/transaction/initialize', payload);

    // Save transaction reference
    order.transactionId = response.data.data.reference;
    await order.save();

    // Return checkout URL to frontend
    res.json({
      authorizationUrl: response.data.data.authorization_url,
      reference: response.data.data.reference,
    });
  } catch (error: any) {
    console.error('Payment init error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Payment initialization failed', error: error.message });
  }
};