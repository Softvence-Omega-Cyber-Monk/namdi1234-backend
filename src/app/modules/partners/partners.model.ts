import mongoose, { Schema } from "mongoose";
import { IPartner } from "./partners.interface";

const PartnerSchema = new Schema<IPartner>(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    logoUrl: {
      type: String,
      required: [true, "Logo is required"],
    },
    cloudinaryId: {
      type: String,
      required: [true, "Cloudinary ID is required"],
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          if (!v) return true; // Optional field
          return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v);
        },
        message: "Please provide a valid website URL",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { 
    timestamps: true 
  }
);

// Indexes for better query performance
PartnerSchema.index({ isActive: 1, displayOrder: 1 });
PartnerSchema.index({ companyName: "text", description: "text" });

// Virtual for logo thumbnail
PartnerSchema.virtual("thumbnailUrl").get(function () {
  // Generate thumbnail version from cloudinary URL
  if (this.logoUrl.includes("cloudinary.com")) {
    return this.logoUrl.replace("/upload/", "/upload/c_thumb,w_200,h_200/");
  }
  return this.logoUrl;
});

export const Partner = mongoose.model<IPartner>("Partner", PartnerSchema);