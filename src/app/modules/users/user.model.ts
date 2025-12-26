import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "./user.interface";

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
    profileImage: { type: String },
    storeBanner: { type: String },
    isActive: { type: Boolean, default: true },
    deactivationReason: { type: String },
    isVerified: { type: Boolean, default: false },
    businessName: { type: String },
    businessType: { type: String },
    businessDescription: { type: String },
    country: { type: String },
    shippingLocation: { type: [String], default: [] }, 
    address: { type: String },
    phone: { type: String },
    bankAccountHolderName: { type: String },
    bankAccountNumber: { type: String },
    bankRoutingNumber: { type: String }, 
    language: { type: String, default: "en" },
    currency: { type: String, default: "USD" },
    holdingTime: { type: Number, default: 24 },
    categories: { type: [String], default: [] },
    paystackSubaccountCode: { type: String },
  },
  {
    timestamps: true,
  }
);


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