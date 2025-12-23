import express, { Router } from 'express';
import { calculateShippingRate } from './shipping.controller';

const router: Router = express.Router();

router.post('/calculate', calculateShippingRate);

export const shippingRoutes = router;