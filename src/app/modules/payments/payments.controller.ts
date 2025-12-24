import { Request, Response } from "express";
import axios from "axios";
import { Payment } from "./paymets.model";
import crypto from "crypto";
import paystack from "../paystack/paystack.utils";


export const initializePayment = async (req: Request, res: Response) => {
    try {
        const { userId, email, amount, orderId, description } = req.body;

        const transactionId = `TXN_${Date.now() + Math.random()}`;

        // Save PENDING payment
        const payment = await Payment.create({
            userId,
            transactionId,
            orderId,
            amount,
            currency: 'NGN',
            status: 'PENDING',
            description,
        });

        // Call Paystack
        const response = await paystack.post('/transaction/initialize', {
            email,
            amount: amount * 100, // Paystack takes amount in kobo
            reference: transactionId,
            metadata: { userId, orderId },
        });

        // Save sessionId
        payment.sessionId = response.data.data.reference;
        await payment.save();

        res.status(200).json({
            success: true,
            authorizationUrl: response.data.data.authorization_url,
            reference: transactionId,
            payment,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.response?.data || error.message,
        });
    }
};


export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const { reference } = req.params;

        const response = await axios.get(
            `${process.env.PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            }
        );

        const paystackData = response.data.data;

        const payment = await Payment.findOne({ transactionId: reference });
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        if (paystackData.status === "success") {
            payment.status = "SUCCESS";
        } else {
            payment.status = "FAILURE";
        }

        payment.gatewayCode = paystackData.gateway_response;
        payment.metadata = paystackData;
        await payment.save();

        res.json({
            success: true,
            payment
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.response?.data || error.message
        });
    }
};


export const paystackWebhook = async (req: Request, res: Response) => {
    const secret = process.env.PAYSTACK_SECRET_KEY as string;

    const hash = crypto
        .createHmac("sha512", secret)
        .update(JSON.stringify(req.body))
        .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
        return res.status(401).send("Invalid signature");
    }

    const event = req.body;

    console.log(event);

    if (event.event === "charge.success") {
        const data = event.data;

        const payment = await Payment.findOne({
            transactionId: data.reference
        });

        if (payment) {
            payment.status = "SUCCESS";
            // payment.gatewayCode = data.gateway_response;
            // payment.metadata = data;
            await payment.save();
        }
    }

    res.sendStatus(200);
};
