import express from "express";
import { initializePayment } from "./payments.controller";


const paymentRouter = express.Router();

paymentRouter.post("/initialize", initializePayment);
// router.get("/verify/:reference", verifyPayment);
// router.post("/webhook", paystackWebhook);

export default paymentRouter;
