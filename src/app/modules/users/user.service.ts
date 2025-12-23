import { UserModel } from "./user.model";
import { IUser } from "./user.interface";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "../../../utils/cloudinaryUpload";
import fs from "fs";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class UserService {
  async registerCustomer(payload: Partial<IUser>): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    payload.role = "CUSTOMER";
    const existingUser = await UserModel.findOne({ email: payload.email });
    if (existingUser) throw new Error("Email already exists");

    const user = new UserModel(payload);
    await user.save();

    const { accessToken, refreshToken } = this.generateTokens(user.id.toString(), user.role);
    return { user, accessToken, refreshToken };
  }

  async registerVendor(payload: Partial<IUser>): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    payload.role = "VENDOR";
    payload.isVerified = false;
    const existingUser = await UserModel.findOne({ email: payload.email });
    if (existingUser) throw new Error("Email already exists");

    const user = new UserModel(payload);
    await user.save();

    const { accessToken, refreshToken } = this.generateTokens(user.id.toString(), user.role);
    return { user, accessToken, refreshToken };
  }

  async login(email: string, password: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) throw new Error("Invalid email or password");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error("Invalid email or password");

    if (user.role === "VENDOR" && !user.isVerified)
      throw new Error("Your vendor profile is pending admin verification");

    const { accessToken, refreshToken } = this.generateTokens(user.id.toString(), user.role);
    user.password = ""; // remove password from response
    return { user, accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const secret = process.env.JWT_REFRESH_SECRET || "refresh_secretkey";
      const decoded = jwt.verify(refreshToken, secret) as { id: string; role: string };

      // Verify user still exists and is active
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

  // Add this method to the UserService class, after getPendingVendors method

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
      // Prevent role or sensitive changes via this method
      delete payload.role;
      delete payload.isVerified;

      // Handle profile image upload
      if (files?.profileImage && files.profileImage.length > 0) {
        const profileImageUrl = await uploadToCloudinary(
          files.profileImage[0].path,
          "users/profiles"
        );
        payload.profileImage = profileImageUrl;
      }

      // Handle store banner upload
      if (files?.storeBanner && files.storeBanner.length > 0) {
        const storeBannerUrl = await uploadToCloudinary(
          files.storeBanner[0].path,
          "users/store-banners"
        );
        payload.storeBanner = storeBannerUrl;
      }

      // Parse categories if it's a string (from form-data)
      if (payload.categories && typeof payload.categories === 'string') {
        try {
          payload.categories = JSON.parse(payload.categories as string);
        } catch (e) {
          // If it's not JSON, treat it as a single category
          payload.categories = [payload.categories as unknown as string];
        }
      }

      // Validate holdingTime if provided
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
      // Clean up uploaded files if update fails
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

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new Error("Current password is incorrect");

    // Update password (pre-save hook should hash it)
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
    return jwt.sign({ id, role }, secret, { expiresIn: "1d" }); // 1 day
  }

  private generateRefreshToken(id: string, role: string): string {
    const secret = process.env.JWT_REFRESH_SECRET || "refresh_secretkey";
    return jwt.sign({ id, role }, secret, { expiresIn: "7d" }); // 7 days
  }

  private generateTokens(id: string, role: string): TokenPair {
    return {
      accessToken: this.generateAccessToken(id, role),
      refreshToken: this.generateRefreshToken(id, role),
    };
  }
}

export const userService = new UserService();