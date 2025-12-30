// src/app/modules/energyUsage/energyUsage.service.ts
import { IEnergyUsage, ICreateEnergyUsage, IUpdateEnergyUsage } from "./energyUsage.interface";
import { EnergyUsageModel } from "./energyUsage.model";

class EnergyUsageService {
  // Create energy usage record
  async createEnergyUsage(data: ICreateEnergyUsage, createdBy: string): Promise<IEnergyUsage> {
    const energyUsage = await EnergyUsageModel.create({ ...data, createdBy });
    return energyUsage;
  }

  // Get all energy usage records (admin)
  async getAllEnergyUsage(): Promise<IEnergyUsage[]> {
    return EnergyUsageModel.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  }

  // Get active energy usage records (public)
  async getActiveEnergyUsage(): Promise<IEnergyUsage[]> {
    return EnergyUsageModel.find({ isActive: true })
      .sort({ serialNumber: 1 });
  }

  // Get energy usage by ID
  async getEnergyUsageById(id: string): Promise<IEnergyUsage | null> {
    return EnergyUsageModel.findById(id)
      .populate("createdBy", "name email");
  }

  // Get energy usage by ref number
  async getEnergyUsageByRefNumber(refNumber: string): Promise<IEnergyUsage | null> {
    return EnergyUsageModel.findOne({ refNumber })
      .populate("createdBy", "name email");
  }

  // Update energy usage
  async updateEnergyUsage(id: string, data: IUpdateEnergyUsage): Promise<IEnergyUsage | null> {
    return EnergyUsageModel.findByIdAndUpdate(id, data, { new: true })
      .populate("createdBy", "name email");
  }

  // Toggle energy usage status
  async toggleEnergyUsageStatus(id: string): Promise<IEnergyUsage | null> {
    const energyUsage = await EnergyUsageModel.findById(id);
    if (!energyUsage) return null;
    
    energyUsage.isActive = !energyUsage.isActive;
    await energyUsage.save();
    
    return energyUsage.populate("createdBy", "name email");
  }

  // Delete energy usage
  async deleteEnergyUsage(id: string): Promise<void> {
    await EnergyUsageModel.findByIdAndDelete(id);
  }

  // Get statistics
  async getEnergyUsageStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const total = await EnergyUsageModel.countDocuments();
    const active = await EnergyUsageModel.countDocuments({ isActive: true });
    const inactive = await EnergyUsageModel.countDocuments({ isActive: false });

    return { total, active, inactive };
  }

  // Bulk create
  async bulkCreateEnergyUsage(
    dataArray: ICreateEnergyUsage[],
    createdBy: string
  ): Promise<IEnergyUsage[]> {
    const records = dataArray.map(data => ({ ...data, createdBy }));
    return EnergyUsageModel.insertMany(records) as unknown as Promise<IEnergyUsage[]>;
  }
}

export const energyUsageService = new EnergyUsageService();