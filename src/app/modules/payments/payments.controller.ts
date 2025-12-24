import { Request, Response } from "express";
import axios from "axios";
import { Payment } from "./paymets.model";
import crypto from "crypto";
import paystack from "../paystack/paystack.utils";

export const createVendorSubAccount = async (req: Request, res: Response) => {
    try {
        const { businessName, bankCode, accountNumber } = req.body;

        const response = await axios.post(
            "https://api.paystack.co/subaccount",
            {
                business_name: businessName,
                settlement_bank: bankCode, // e.g. "044" for Access Bank
                account_number: accountNumber,
                percentage_charge: 10,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.json({ success: true, subaccount: response.data.data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.response?.data || err.message });
    }
};


export const initializePayment = async (req: Request, res: Response) => {
    try {
        const { userId, email, amount, orderId, description, vendorSubaccount } = req.body;

        const transactionId = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}_${Date.now()}_${Math.random()}`;

        // 1️⃣ Save PENDING payment
        const payment = await Payment.create({
            userId,
            transactionId,
            orderId,
            amount,
            currency: "NGN",
            status: "PENDING",
            description,
            vendorSubaccount,
        });

        const response = await paystack.post("/transaction/initialize", {
            email,
            amount: amount * 100,
            reference: transactionId,

            // ✅ Subaccount config
            subaccount: vendorSubaccount,   // Vendor gets the money
            bearer: "subaccount",            // Vendor pays Paystack charges
            // bearer: "account",            // Platform pays charges (optional)

            metadata: {
                userId,
                orderId,
                paymentId: payment._id,
            },
        });

        // 3️⃣ Save Paystack reference
        payment.sessionId = response.data.data.reference;
        await payment.save();

        // 4️⃣ Response
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



// export const verifyPayment = async (req: Request, res: Response) => {
//     try {
//         const { reference } = req.params;

//         const response = await axios.get(
//             `${process.env.PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
//                 }
//             }
//         );

//         const paystackData = response.data.data;

//         const payment = await Payment.findOne({ transactionId: reference });
//         if (!payment) {
//             return res.status(404).json({ message: "Payment not found" });
//         }

//         if (paystackData.status === "success") {
//             payment.status = "SUCCESS";
//         } else {
//             payment.status = "FAILURE";
//         }

//         payment.gatewayCode = paystackData.gateway_response;
//         payment.metadata = paystackData;
//         await payment.save();

//         res.json({
//             success: true,
//             payment
//         });

//     } catch (error: any) {
//         res.status(500).json({
//             success: false,
//             message: error.response?.data || error.message
//         });
//     }
// };


export const paystackWebhook = async (req: Request, res: Response) => {
    const secret = process.env.PAYSTACK_SECRET_KEY as string;
    const signature = req.headers["x-paystack-signature"] as string;

    const rawBody = req.body as Buffer;

    const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");

    if (hash !== signature) {
        console.log("❌ Invalid Paystack signature");
        return res.sendStatus(401);
    }

    const event = JSON.parse(rawBody.toString("utf8"));
    console.log("✅ Paystack Event:", event.event);

    if (event.event === "charge.success") {
        const data = event.data;
        const payment = await Payment.findOne({ transactionId: data.reference });
        if (payment) {
            payment.status = "SUCCESS";
            await payment.save();
            console.log("💰 Payment updated");
        }
    }

    res.sendStatus(200);
};
