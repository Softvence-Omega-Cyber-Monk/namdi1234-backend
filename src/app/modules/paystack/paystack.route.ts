// routes/payment.routes.ts
import { Router } from 'express';
import { initializePayment } from './paystack.custome';
import { createVendorSubaccount } from './paystack.vendor.controller';

const router = Router();

// Protected routes
router.post('/initialize/:orderId',  initializePayment);
router.post('/vendor/:userId/subaccount', createVendorSubaccount);

export const  paystackRouter = router;