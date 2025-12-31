// src/app/modules/countdown/countdown.service.ts
import { ICountdown, ICreateCountdown, IUpdateCountdown } from "./countdown.interface";
import { CountdownModel } from "./countdown.model";

class CountdownService {
  // Create countdown
  async createCountdown(data: ICreateCountdown, createdBy: string): Promise<ICountdown> {
    const countdown = await CountdownModel.create({ ...data, createdBy });
    return countdown;
  }

  // Get all countdowns (admin)
  async getAllCountdowns(): Promise<ICountdown[]> {
    return CountdownModel.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  }

  // Get active countdown by type (public)
  async getActiveCountdownByType(type: string): Promise<ICountdown | null> {
    return CountdownModel.findOne({ 
      type, 
      isActive: true,
      endDate: { $gt: new Date() } // Only return if not expired
    })
      .sort({ createdAt: -1 });
  }

  // Get all active countdowns (public)
  async getActiveCountdowns(): Promise<ICountdown[]> {
    return CountdownModel.find({ 
      isActive: true,
      endDate: { $gt: new Date() }
    })
      .sort({ endDate: 1 });
  }

  // Get countdown by ID
  async getCountdownById(id: string): Promise<ICountdown | null> {
    return CountdownModel.findById(id)
      .populate("createdBy", "name email");
  }

  // Update countdown
  async updateCountdown(id: string, data: IUpdateCountdown): Promise<ICountdown | null> {
    return CountdownModel.findByIdAndUpdate(id, data, { new: true })
      .populate("createdBy", "name email");
  }

  // Toggle countdown status
  async toggleCountdownStatus(id: string): Promise<ICountdown | null> {
    const countdown = await CountdownModel.findById(id);
    if (!countdown) return null;
    
    countdown.isActive = !countdown.isActive;
    await countdown.save();
    
    return countdown.populate("createdBy", "name email");
  }

  // Delete countdown
  async deleteCountdown(id: string): Promise<void> {
    await CountdownModel.findByIdAndDelete(id);
  }

  // Get statistics
  async getCountdownStats(): Promise<{
    total: number;
    active: number;
    expired: number;
  }> {
    const total = await CountdownModel.countDocuments();
    const active = await CountdownModel.countDocuments({ 
      isActive: true,
      endDate: { $gt: new Date() }
    });
    const expired = await CountdownModel.countDocuments({ 
      endDate: { $lte: new Date() }
    });

    return { total, active, expired };
  }
}

export const countdownService = new CountdownService();