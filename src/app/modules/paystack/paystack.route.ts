// import express from 'express';
// import axios from 'axios';

// const router = express.Router();
// const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// // 1. Initialize transaction (called by frontend)
// router.post('/initialize', async (req, res) => {
//   try {
//     const { email, amount, reference, metadata = {} } = req.body;

//     // 💡 Validate input
//     if (!email || !amount || !reference) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     // 💡 Optional: Save pending transaction in DB (with status 'pending')
//     // await db.transaction.create({ reference, email, amount, status: 'pending' });

//     const response = await axios.post(
//       'https://api.paystack.co/transaction/initialize', // ✅ No trailing spaces!
//       {
//         email,
//         amount: Math.round(amount * 100), // Convert ₦ to kobo (e.g., 1500 → 150000)
//         reference,
//         callback_url: `${process.env.FRONTEND_URL}/payment/success?reference=${reference}`,
//         metadata, // e.g., { cartId: "cart_123" }
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     return res.json(response.data);
//   } catch (error: any) {
//     console.error('Init error:', error.response?.data || error.message);
//     return res.status(500).json({ message: 'Payment initialization failed' });
//   }
// });

// // 2. Verify transaction (called by frontend AFTER payment)
// router.get('/verify/:reference', async (req, res) => {
//   try {
//     const { reference } = req.params;

//     const response = await axios.get(
//       `https://api.paystack.co/transaction/verify/${reference}`, // ✅ No spaces!
//       {
//         headers: {
//           Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
//         },
//       }
//     );

//     const { status, data } = response.data;

//     if (status === true && data.status === 'success') {
//       // ✅ Critical: Verify amount matches what you expected!
//       // const expectedAmount = await getExpectedAmountFromDB(data.reference);
//       // if (data.amount !== expectedAmount * 100) {
//       //   return res.status(400).json({ success: false, message: 'Amount mismatch' });
//       // }

//       // 💡 Update order/transaction status in DB to 'paid'
//       // await db.transaction.update({ where: { reference }, data: { status: 'paid' } });

//       return res.json({ success: true, data });
//     } else {
//       return res.json({ success: false, message: 'Payment not successful' });
//     }
//   } catch (error: any) {
//     console.error('Verify error:', error.response?.data || error.message);
//     return res.status(500).json({ message: 'Verification failed' });
//   }
// });

// export const paystackRouter = router;


// routes/payment.routes.ts
import { Router } from 'express';
import { initializePayment } from './paystack.custome';
import { createVendorSubaccount } from './paystack.vendor.controller';
// import {
//   initializePayment,
//   handlePaystackWebhook,
// } from '../controllers/payment.controller';
// import { createVendorSubaccount } from '../controllers/vendor.controller';

const router = Router();

// Public webhook (no auth)
// router.post('/webhook/paystack', handlePaystackWebhook);

// Protected routes
router.post('/initialize/:orderId',  initializePayment);
router.post('/vendor/:userId/subaccount', createVendorSubaccount);

export const  paystackRouter = router;