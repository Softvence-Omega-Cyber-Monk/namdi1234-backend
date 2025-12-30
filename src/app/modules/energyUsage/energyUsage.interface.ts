// src/app/modules/energyUsage/energyUsage.interface.ts
import { Document, Schema } from "mongoose";

export interface IEnergyUsage extends Document {
  serialNumber: string;
  refNumber: string;
  description: string;
  inverterSize: string;
  lithiumTub: string;
  panelSize: string;
  numberOfPanels: string;
  subtotal: string;
  totalAccessories: string;
  ait: string;
  netAmount: string;
  totalPayment: string;
  remarks?: string;
  isActive: boolean;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateEnergyUsage {
  serialNumber: string;
  refNumber: string;
  description: string;
  inverterSize: string;
  lithiumTub: string;
  panelSize: string;
  numberOfPanels: string;
  subtotal: string;
  totalAccessories: string;
  ait: string;
  netAmount: string;
  totalPayment: string;
  remarks?: string;
}

export interface IUpdateEnergyUsage {
  serialNumber?: string;
  refNumber?: string;
  description?: string;
  inverterSize?: string;
  lithiumTub?: string;
  panelSize?: string;
  numberOfPanels?: string;
  subtotal?: string;
  totalAccessories?: string;
  ait?: string;
  netAmount?: string;
  totalPayment?: string;
  remarks?: string;
  isActive?: boolean;
}