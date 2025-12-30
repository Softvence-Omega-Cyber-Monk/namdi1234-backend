// app.ts
import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { setupSwagger } from "./app/config/swagger";
import { UserRoutes } from "./app/modules/users/user.routes";
import { ProductRoutes } from "./app/modules/products/product.routes";
import { WishlistRoutes } from "./app/modules/wishlist/wishlist.routes";
import { CategoryRoute } from "./app/modules/category/category.route";
import { ReviewRoutes } from "./app/modules/review/review.routes";
import { SupportRoute } from "./app/modules/support/support.routes";
import { NewsletterRoute } from "./app/modules/newsletter/newsletter.routes";
import { CouponRoute } from "./app/modules/coupon/coupon.routes";
import { OrderRoute } from "./app/modules/order/order.routes";
import { ShipmentRouter } from "./app/modules/shipment/shipment.router";
import { AFSPayment } from "./app/modules/afsPayment/afsPayment.routes";
import { WalletRoutes } from "./app/modules/wallet/wallet.routes";
import { PolicyRoutes } from "./app/modules/policy/policy.routes";
import { PartnerRoutes } from "./app/modules/partners/partners.routes";
import { shippingRoutes } from "./app/modules/shipping/shipping.routes";
import { PayoutRoutes } from "./app/modules/payout/payout.routes";
import { CartRoutes } from "./app/modules/cart/cart.routes";
import { paystackRouter } from "./app/modules/paystack/paystack.route";
import paymentRouter from "./app/modules/payments/payments.routes";
import { paystackWebhook } from "./app/modules/payments/payments.controller";
import { BlogRoutes } from "./app/modules/blog/blog.routes";
import { SliderBannerRoutes } from "./app/modules/slider-banner/sliderBanner.routes";
import { TestimonialRoutes } from "./app/modules/testimonial/testimonial.routes";
import { EnergyUsageRoutes } from "./app/modules/energyUsage/energyUsage.routes";

dotenv.config();

// ✅ Create Express app
const app = express();

app.post("/webhook", express.raw({ type: "*/*" }), paystackWebhook);

// ✅ Middleware
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://mditems.com",
      "https://fahadpervez-client.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));

// ✅ Swagger setup
setupSwagger(app);




// ✅ Routes
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/products", ProductRoutes);
app.use("/api/v1/wishlist", WishlistRoutes);
app.use("/api/v1/category", CategoryRoute);
app.use("/api/v1/reviews", ReviewRoutes);
app.use("/api/v1/support", SupportRoute);
app.use("/api/v1/newsletter", NewsletterRoute);
app.use("/api/v1/coupons", CouponRoute);
app.use("/api/v1/orders", OrderRoute);
app.use("/api/v1/payment", paymentRouter)
app.use("/api/v1/shipment", ShipmentRouter)
app.use('/api/v1/afspay', AFSPayment)
app.use("/api/v1/wallet", WalletRoutes);
app.use("/api/v1/policy", PolicyRoutes)
app.use("/api/v1/partners", PartnerRoutes)
app.use("/api/v1/shipping", shippingRoutes)
app.use("/api/v1/payouts", PayoutRoutes)
app.use("/api/v1/cart", CartRoutes)
app.use("/api/v1/payments", paystackRouter)
app.use("/api/v1/blogs", BlogRoutes)
app.use("/api/v1/cms", SliderBannerRoutes);
app.use("/api/v1/tst",TestimonialRoutes);
app.use('/api/v1/energy-usage', EnergyUsageRoutes);




app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});


// ✅ Default route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json("Welcome to multivendor medicine app");
});

export default app;
