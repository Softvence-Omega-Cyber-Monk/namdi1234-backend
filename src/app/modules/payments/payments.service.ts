// src/server.ts
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import axios from "axios";
import crypto from "crypto";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Create Vendor Subaccount


// ✅ Initialize Payment (Destination: Vendor Subaccount)
app.post("/checkout", async (req: Request, res: Response) => {
  try {
    const { email, amount, orderId, vendorSubaccount } = req.body;

    const transactionId = `TXN_${Date.now()}`;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // kobo
        reference: transactionId,
        subaccount: vendorSubaccount, // 💰 Vendor gets funds
        bearer: "subaccount", // vendor bears charges
        metadata: { orderId },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      authorizationUrl: response.data.data.authorization_url,
      reference: transactionId,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.response?.data || err.message });
  }
});

// ✅ Webhook (Verify Signature + Update DB)
app.post("/webhook", express.raw({ type: "*/*" }), async (req: Request, res: Response) => {
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
    console.log("💰 Payment succeeded for reference:", data.reference);
    // এখানে DB update করো (Payment status = SUCCESS)
  }

  res.sendStatus(200);
});

// ✅ Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`⚡ Server running at http://localhost:${PORT}`);
});
