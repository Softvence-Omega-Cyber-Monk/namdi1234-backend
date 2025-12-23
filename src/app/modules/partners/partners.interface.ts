import { Document } from "mongoose";

export interface IPartner extends Document {
  companyName: string;
  logoUrl: string;
  cloudinaryId: string;
  website?: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePartner {
  companyName: string;
  website?: string;
  description?: string;
  displayOrder?: number;
}

export interface IUpdatePartner {
  companyName?: string;
  website?: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface IPartnerFilters {
  isActive?: boolean;
  searchTerm?: string;
}