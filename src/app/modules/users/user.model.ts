import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, PaymentMethod, ProductCategory } from "./user.interface";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },

    role: {
      type: String,
      enum: ["ADMIN", "VENDOR", "CUSTOMER"],
      default: "CUSTOMER",
    },
    profileImage: {
      type: String
    },
    isActive: { type: Boolean, default: true },
    deactivationReason: { type: String },
    isVerified: { type: Boolean },
    businessName: { type: String },
    businessCRNumber: { type: String },
    CRDocuments: { type: String },
    businessType: { type: String },
    businessDescription: { type: String },
    country: { type: String },
    productCategory: {
      type: [String],
      enum: Object.values(ProductCategory),
    },
    shippingLocation: {
      type: [Object], 
    },
    storeDescription: { type: String },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod)
    },
    bankAccountHolderName: { type: String },
    bankAccountNumber: { type: String },
    bankRoughingNumber: { type: String },
    taxId: { type: String },
    isPrivacyPolicyAccepted: { type: Boolean },
    vendorSignature: { type: String },
    vendorContract: { type: String },
    isSellerPolicyAccepted: { type: Boolean },
    address: { type: String },
    orderNotification: {type: String, default: "New Order"},
    promotionNotification: {type: String, default: "Promotion Notification"},
    communicationAlert: {type: String, default: "Communication Alerts"},
    newReviewsNotification: {type: String, default: "New Reviews"},
    phone: { type: String },
    language: {type: String, default: "English"},
    currency: {type: String},
    holdingTime: {type: Number},
    categories: {type: [String]},
    storeBanner: {type: String},
    paystackSubaccountCode: { type: String }, // Add this
  },
  {
    timestamps: true,
  }
);

// Hash password before save
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = model<IUser>("User", userSchema);
