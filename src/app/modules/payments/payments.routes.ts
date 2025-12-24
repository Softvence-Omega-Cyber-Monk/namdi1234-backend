import express from "express";
import { createVendorSubAccount, initializePayment } from "./payments.controller";


const paymentRouter = express.Router();

paymentRouter.post("/initialize", initializePayment);
paymentRouter.post("/vendorSubAccount", createVendorSubAccount)
// router.get("/verify/:reference", verifyPayment);
// router.post("/webhook", paystackWebhook);

export default paymentRouter;
