// src/app/modules/energyUsage/energyUsage.controller.ts
import { Request, Response } from "express";
import { energyUsageService } from "./energyUsage.service";
import { ICreateEnergyUsage } from "./energyUsage.interface";

class EnergyUsageController {
  // Create energy usage record
  async createEnergyUsage(req: Request, res: Response) {
    try {
      const createdBy = (req as any).user.id;
      const data: ICreateEnergyUsage = req.body;

      // Validation
      const requiredFields = [
        'serialNumber', 'refNumber', 'description', 'inverterSize',
        'lithiumTub', 'panelSize', 'numberOfPanels', 'subtotal',
        'totalAccessories', 'ait', 'netAmount', 'totalPayment'
      ];

      for (const field of requiredFields) {
        if (!data[field as keyof ICreateEnergyUsage]) {
          return res.status(400).json({
            success: false,
            message: `${field} is required`
          });
        }
      }

      const energyUsage = await energyUsageService.createEnergyUsage(data, createdBy);

      res.status(201).json({
        success: true,
        message: "Energy usage record created successfully",
        data: energyUsage,
      });
    } catch (err: any) {
      console.error("Create Energy Usage Error:", err);
      res.status(400).json({ 
        success: false, 
        message: err.message || "Failed to create energy usage record"
      });
    }
  }

  // Get all energy usage records (admin)
  async getAllEnergyUsage(req: Request, res: Response) {
    try {
      const records = await energyUsageService.getAllEnergyUsage();
      res.json({ 
        success: true, 
        data: records,
        count: records.length 
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get active energy usage records (public)
  async getActiveEnergyUsage(req: Request, res: Response) {
    try {
      const records = await energyUsageService.getActiveEnergyUsage();
      res.json({ 
        success: true, 
        data: records,
        count: records.length 
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get energy usage by ID
  async getEnergyUsageById(req: Request, res: Response) {
    try {
      const energyUsage = await energyUsageService.getEnergyUsageById(req.params.id);
      
      if (!energyUsage) {
        return res.status(404).json({ 
          success: false, 
          message: "Energy usage record not found" 
        });
      }

      res.json({ success: true, data: energyUsage });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get energy usage by ref number
  async getEnergyUsageByRefNumber(req: Request, res: Response) {
    try {
      const energyUsage = await energyUsageService.getEnergyUsageByRefNumber(
        req.params.refNumber
      );
      
      if (!energyUsage) {
        return res.status(404).json({ 
          success: false, 
          message: "Energy usage record not found" 
        });
      }

      res.json({ success: true, data: energyUsage });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Update energy usage
  async updateEnergyUsage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const energyUsage = await energyUsageService.updateEnergyUsage(id, updateData);
      
      if (!energyUsage) {
        return res.status(404).json({ 
          success: false, 
          message: "Energy usage record not found" 
        });
      }

      res.json({
        success: true,
        message: "Energy usage record updated successfully",
        data: energyUsage,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Toggle energy usage status
  async toggleEnergyUsageStatus(req: Request, res: Response) {
    try {
      const energyUsage = await energyUsageService.toggleEnergyUsageStatus(req.params.id);
      
      if (!energyUsage) {
        return res.status(404).json({ 
          success: false, 
          message: "Energy usage record not found" 
        });
      }

      res.json({
        success: true,
        message: `Energy usage record ${energyUsage.isActive ? "activated" : "deactivated"}`,
        data: energyUsage,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Delete energy usage
  async deleteEnergyUsage(req: Request, res: Response) {
    try {
      await energyUsageService.deleteEnergyUsage(req.params.id);
      res.json({ 
        success: true, 
        message: "Energy usage record deleted successfully" 
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Get statistics
  async getStats(req: Request, res: Response) {
    try {
      const stats = await energyUsageService.getEnergyUsageStats();
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Bulk create
  async bulkCreateEnergyUsage(req: Request, res: Response) {
    try {
      const createdBy = (req as any).user.id;
      const { records } = req.body;

      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Records array is required and must not be empty"
        });
      }

      const energyUsageRecords = await energyUsageService.bulkCreateEnergyUsage(
        records,
        createdBy
      );

      res.status(201).json({
        success: true,
        message: `${energyUsageRecords.length} energy usage records created successfully`,
        data: energyUsageRecords,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

export const energyUsageController = new EnergyUsageController();