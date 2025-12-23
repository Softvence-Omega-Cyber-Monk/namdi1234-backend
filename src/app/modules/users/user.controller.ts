import { CookieOptions, Request, Response } from "express";
import { userService } from "./user.service";

// Cookie configuration helper function
const getCookieOptions = (maxAge: number) => {
  return {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production", // true in production
    secure: true,
    sameSite: "none" as CookieOptions["sameSite"],
    maxAge: maxAge,
  };
};

export class UserController {
  async registerCustomer(req: Request, res: Response) {
    try {
      const { user, accessToken, refreshToken } = await userService.registerCustomer(req.body);

      // Set tokens in cookies
      res.cookie("accessToken", accessToken, getCookieOptions(60 * 24 * 60 * 1000)); // 1 days
      res.cookie("refreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days

      res.status(201).json({
        success: true,
        message: "Customer registered successfully",
        data: { user, accessToken, refreshToken }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async registerVendor(req: Request, res: Response) {
    try {
      const { user, accessToken, refreshToken } = await userService.registerVendor(req.body);

      // Set tokens in cookies
      res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000)); // 15 minutes
      res.cookie("refreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days

      res.status(201).json({
        success: true,
        message: "Vendor registered successfully. Please wait for admin verification.",
        data: { user, accessToken, refreshToken },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await userService.login(email, password);

      // Set tokens in cookies
      res.cookie("accessToken", accessToken, getCookieOptions(60 * 60 * 1000)); // 15 minutes
      res.cookie("refreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days

      res.json({
        success: true,
        message: "Login successful",
        data: { user, accessToken, refreshToken }
      });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ success: false, message: "Refresh token not provided" });
      }

      const { accessToken } = await userService.refreshAccessToken(refreshToken);

      // Set new access token in cookie
      res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000)); // 15 minutes

      res.json({
        success: true,
        message: "Access token refreshed successfully",
        data: { accessToken }
      });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      // Clear cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.json({ success: true, message: "Logged out successfully" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async verifyVendor(req: Request, res: Response) {
    try {
      const vendorId = req.params.id;
      const vendor = await userService.verifyVendor(vendorId);
      res.json({ success: true, message: "Vendor verified successfully", data: vendor });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllVendors(req: Request, res: Response) {
    try {
      const vendors = await userService.getAllVendors();
      res.json({ success: true, data: vendors });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getPendingVendors(req: Request, res: Response) {
    try {
      const pendingVendors = await userService.getPendingVendors();
      res.json({ success: true, data: pendingVendors });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Add this method to the UserController class, after getPendingVendors method

  async getPendingVendorById(req: Request, res: Response) {
    try {
      const vendorId = req.params.id;
      const vendor = await userService.getPendingVendorById(vendorId);
      res.json({ success: true, data: vendor });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getAllCustomers(req: Request, res: Response) {
    try {
      const customers = await userService.getAllCustomers();
      res.json({ success: true, data: customers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id || (req as any).user.id;
      const user = await userService.getUserById(userId);
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      // Extract files from multer
      const files = req.files as {
        [fieldname: string]: Express.Multer.File[]
      };

      const imageFiles = {
        profileImage: files?.profileImage,
        storeBanner: files?.storeBanner,
      };

      const updatedUser = await userService.updateUser(userId, req.body, imageFiles);

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "All fields are required"
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "New password and confirm password do not match"
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long"
        });
      }

      await userService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: "Password changed successfully"
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deactivateUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const { reason } = req.body;
      const user = await userService.deactivateUser(userId, reason);
      res.json({ success: true, message: "User deactivated successfully", data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      await userService.deleteUser(userId);
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export const userController = new UserController();
