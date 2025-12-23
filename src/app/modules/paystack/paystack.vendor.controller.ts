// controllers/vendor.controller.ts
import { Request, Response } from "express";
import { UserModel } from "../users/user.model";
import paystack from "./paystack.utils";

// Helper: Get bank code from name (simplified)
const getBankCode = (bankName: string): string => {
  const banks: Record<string, string> = {
    "Zenith Bank": "057",
    "Access Bank": "044",
    GTBank: "058",
    "First Bank": "011",
    UBA: "033",
    "Wema Bank": "035",
    "Stanbic IBTC": "221",
    "Sterling Bank": "232",
    "Fidelity Bank": "070",
    "Union Bank": "032",
    Ecobank: "050",
    "Providus Bank": "101",
    "Polaris Bank": "091", // (formerly Skye Bank)
    "Titan Trust Bank": "102",
    // Add others as needed
  };
  return banks[bankName] || "058"; // fallback to GTBank
};

export const createVendorSubaccount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const vendor = await UserModel.findById(userId);
    if (!vendor || vendor.role !== "VENDOR") {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Skip if already created
    if (vendor.paystackSubaccountCode) {
      return res
        .status(200)
        .json({ subaccountCode: vendor.paystackSubaccountCode });
    }

    // Validate bank details
    if (!vendor.bankAccountNumber || !vendor.bankAccountHolderName) {
      return res.status(400).json({ message: "Bank details missing" });
    }

    // --- FOR TESTING ONLY ---
    const payload = {
      business_name: "John's Solar Shop",
      settlement_bank: "057", // Zenith Bank
      account_number: "0000000000",
      primary_contact_email: "vendogr@example.com",
      primary_contact_name: "John Doe",
      percentage_charge: 10.0,
    };
    const response = await paystack.post("/subaccount", payload);
    const subaccountCode = response.data.data.subaccount_code;

    // Save to vendor
    vendor.paystackSubaccountCode = subaccountCode;
    await vendor.save();

    res.status(201).json({ subaccountCode });
  } catch (error: any) {
    console.error("Subaccount error:", error.response?.data || error.message);
    res
      .status(500)
      .json({ message: "Failed to create subaccount", error: error.message });
  }
};
