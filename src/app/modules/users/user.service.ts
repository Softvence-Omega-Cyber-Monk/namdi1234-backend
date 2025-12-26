import { UserModel } from "./user.model";
import { IUser } from "./user.interface";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "../../../utils/cloudinaryUpload";
import fs from "fs";
import axios from "axios";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Helper: Get bank code from name
const getBankCode = (bankName: string): string => {
  const banks: Record<string, string> = {
    "Zenith Bank": "057",
    "Access Bank": "044",
    "GTBank": "058",
    "First Bank": "011",
    "UBA": "033",
    "Wema Bank": "035",
    "Stanbic IBTC": "221",
    "Sterling Bank": "232",
    "Fidelity Bank": "070",
    "Union Bank": "032",
    "Ecobank": "050",
    "Providus Bank": "101",
    "Polaris Bank": "091",
    "Titan Trust Bank": "102",
  };
  return banks[bankName] || "058";
};

export class UserService {
  async registerCustomer(data: any): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    try {
      const payload: Partial<IUser> = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "CUSTOMER",
      };

      const existingUser = await UserModel.findOne({ email: payload.email });
      if (existingUser) throw new Error("Email already exists");

      const user = new UserModel(payload);
      await user.save();

      const { accessToken, refreshToken } = this.generateTokens(user.id.toString(), user.role);
      
      const userObject = user.toObject();
      
      return { user: userObject as IUser, accessToken, refreshToken };
    } catch (error: any) {
      console.error("Customer registration error:", error);
      throw error;
    }
  }

  async registerVendor(data: any): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    try {
      const payload: Partial<IUser> = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        address: data.address,
        businessName: data.businessName,
        businessType: data.businessType,
        businessDescription: data.businessDescription,
        country: data.country,
        bankAccountHolderName: data.bankAccountHolderName,
        bankAccountNumber: data.bankAccountNumber,
        bankRoutingNumber: data.bankRoutingNumber,
        role: "VENDOR",
        isVerified: false,
      };

      const existingUser = await UserModel.findOne({ email: payload.email });
      if (existingUser) throw new Error("Email already exists");

      // Create vendor user
      const user = new UserModel(payload);
      await user.save();

      const { accessToken, refreshToken } = this.generateTokens(user.id.toString(), user.role);
      
      const userObject = user.toObject();
      
      return { user: userObject as IUser, accessToken, refreshToken };
    } catch (error: any) {
      console.error("Vendor registration error:", error);
      throw error;
    }
  }

  // New method to create vendor subaccount
  async createVendorSubaccount(vendorId: string, bankName: string): Promise<{ subaccountCode: string; accountName: string }> {
    try {
      const vendor = await UserModel.findById(vendorId);
      if (!vendor) throw new Error("Vendor not found");
      if (vendor.role !== "VENDOR") throw new Error("User is not a vendor");

      // Check if subaccount already exists
      if (vendor.paystackSubaccountCode) {
        throw new Error("Vendor already has a subaccount");
      }

      // Validate required fields
      if (!vendor.bankAccountNumber || !vendor.bankAccountHolderName || !vendor.businessName) {
        throw new Error("Missing bank details. Please update your profile first.");
      }

      const bankCode = getBankCode(bankName);

      const paystackPayload = {
        business_name: vendor.businessName,
        settlement_bank: bankCode,
        account_number: vendor.bankAccountNumber,
        primary_contact_email: vendor.email,
        primary_contact_name: vendor.bankAccountHolderName,
        percentage_charge: 10.0, // Platform takes 10%
      };

      const response = await axios.post("/api/v1/payment/vendorSubAccount", paystackPayload)
      const subaccountCode = response.data.data.subaccount_code;
      const accountName = response.data.data.account_name;

      // Save subaccount code to user profile
      vendor.paystackSubaccountCode = subaccountCode;
      await vendor.save();

      console.log(`✅ Subaccount created for vendor: ${vendor.email}`);

      return { subaccountCode, accountName };
    } catch (error: any) {
      console.error("Subaccount creation error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || "Failed to create subaccount");
    }
  }

  async login(email: string, password: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) throw new Error("Invalid email or password");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error("Invalid email or password");

    if (user.role === "VENDOR" && !user.isVerified)
      throw new Error("Your vendor profile is pending admin verification");

    const { accessToken, refreshToken } = this.generateTokens(user.id.toString(), user.role);
    
    const userObject = user.toObject();
    
    return { user: userObject as IUser, accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const secret = process.env.JWT_REFRESH_SECRET || "refresh_secretkey";
      const decoded = jwt.verify(refreshToken, secret) as { id: string; role: string };

      const user = await UserModel.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new Error("User not found or inactive");
      }

      const accessToken = this.generateAccessToken(decoded.id, decoded.role);
      return { accessToken };
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  async verifyVendor(vendorId: string): Promise<IUser | null> {
    const vendor = await UserModel.findById(vendorId);
    if (!vendor) throw new Error("Vendor not found");
    vendor.isVerified = true;
    return vendor.save();
  }

  async getAllVendors(): Promise<IUser[]> {
    return UserModel.find({ role: "VENDOR" });
  }

  async getPendingVendors(): Promise<IUser[]> {
    return UserModel.find({ role: "VENDOR", isVerified: false });
  }

  async getPendingVendorById(vendorId: string): Promise<IUser | null> {
    const vendor = await UserModel.findOne({
      _id: vendorId,
      role: "VENDOR",
      isVerified: false
    });

    if (!vendor) {
      throw new Error("Pending vendor not found");
    }

    return vendor;
  }

  async getAllCustomers(): Promise<IUser[]> {
    return UserModel.find({ role: "CUSTOMER" });
  }

  async getUserById(userId: string): Promise<IUser | null> {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateUser(
    userId: string,
    payload: Partial<IUser>,
    files?: {
      profileImage?: Express.Multer.File[];
      storeBanner?: Express.Multer.File[];
    }
  ): Promise<IUser | null> {
    try {
      delete payload.role;
      delete payload.isVerified;

      if (files?.profileImage && files.profileImage.length > 0) {
        const profileImageUrl = await uploadToCloudinary(
          files.profileImage[0].path,
          "users/profiles"
        );
        payload.profileImage = profileImageUrl;
      }

      if (files?.storeBanner && files.storeBanner.length > 0) {
        const storeBannerUrl = await uploadToCloudinary(
          files.storeBanner[0].path,
          "users/store-banners"
        );
        payload.storeBanner = storeBannerUrl;
      }

      if (payload.categories && typeof payload.categories === 'string') {
        try {
          payload.categories = JSON.parse(payload.categories as string);
        } catch (e) {
          payload.categories = [payload.categories as unknown as string];
        }
      }

      if (payload.holdingTime !== undefined) {
        const holdingTime = Number(payload.holdingTime);
        if (isNaN(holdingTime) || holdingTime < 0) {
          throw new Error("Invalid holding time value");
        }
        payload.holdingTime = holdingTime;
      }

      const updatedUser = await UserModel.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
      });

      if (!updatedUser) throw new Error("User not found");
      return updatedUser;
    } catch (error) {
      if (files?.profileImage?.[0]?.path && fs.existsSync(files.profileImage[0].path)) {
        fs.unlinkSync(files.profileImage[0].path);
      }
      if (files?.storeBanner?.[0]?.path && fs.existsSync(files.storeBanner[0].path)) {
        fs.unlinkSync(files.storeBanner[0].path);
      }
      throw error;
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await UserModel.findById(userId).select("+password");
    if (!user) throw new Error("User not found");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new Error("Current password is incorrect");

    user.password = newPassword;
    await user.save();
  }

  async deactivateUser(userId: string, reason?: string): Promise<IUser | null> {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found");

    user.isActive = false;
    if (reason) user.deactivationReason = reason;

    return user.save();
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found");

    await UserModel.findByIdAndDelete(userId);
  }

  private generateAccessToken(id: string, role: string): string {
    const secret = process.env.JWT_SECRET || "secretkey";
    return jwt.sign({ id, role }, secret, { expiresIn: "1d" });
  }

  private generateRefreshToken(id: string, role: string): string {
    const secret = process.env.JWT_REFRESH_SECRET || "refresh_secretkey";
    return jwt.sign({ id, role }, secret, { expiresIn: "7d" });
  }

  private generateTokens(id: string, role: string): TokenPair {
    return {
      accessToken: this.generateAccessToken(id, role),
      refreshToken: this.generateRefreshToken(id, role),
    };
  }
}

export const userService = new UserService();