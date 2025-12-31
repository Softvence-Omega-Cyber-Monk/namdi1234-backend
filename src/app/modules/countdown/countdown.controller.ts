// src/app/modules/countdown/countdown.controller.ts
import { Request, Response } from "express";
import { countdownService } from "./countdown.service";
import { ICreateCountdown } from "./countdown.interface";

class CountdownController {
  // Create countdown
  async createCountdown(req: Request, res: Response) {
    try {
      const createdBy = (req as any).user.id;
      const data: ICreateCountdown = req.body;

      // Validation
      if (!data.title || !data.description || !data.endDate || !data.type) {
        return res.status(400).json({
          success: false,
          message: "Title, description, endDate, and type are required"
        });
      }

      // Validate end date is in the future
      const endDate = new Date(data.endDate);
      if (endDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "End date must be in the future"
        });
      }

      const countdown = await countdownService.createCountdown(data, createdBy);

      res.status(201).json({
        success: true,
        message: "Countdown created successfully",
        data: countdown,
      });
    } catch (err: any) {
      console.error("Create Countdown Error:", err);
      res.status(400).json({ 
        success: false, 
        message: err.message || "Failed to create countdown"
      });
    }
  }

  // Get all countdowns (admin)
  async getAllCountdowns(req: Request, res: Response) {
    try {
      const countdowns = await countdownService.getAllCountdowns();
      res.json({ 
        success: true, 
        data: countdowns,
        count: countdowns.length 
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get active countdown by type (public)
  async getActiveCountdownByType(req: Request, res: Response) {
    try {
      const { type } = req.params;
      
      const validTypes = ['exclusive_offer', 'weekend_deals', 'flash_sale', 'general'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid type. Must be one of: exclusive_offer, weekend_deals, flash_sale, general"
        });
      }

      const countdown = await countdownService.getActiveCountdownByType(type);
      
      if (!countdown) {
        return res.json({
          success: true,
          data: null,
          message: "No active countdown found for this type"
        });
      }

      res.json({ success: true, data: countdown });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get all active countdowns (public)
  async getActiveCountdowns(req: Request, res: Response) {
    try {
      const countdowns = await countdownService.getActiveCountdowns();
      res.json({ 
        success: true, 
        data: countdowns,
        count: countdowns.length 
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get countdown by ID
  async getCountdownById(req: Request, res: Response) {
    try {
      const countdown = await countdownService.getCountdownById(req.params.id);
      
      if (!countdown) {
        return res.status(404).json({ 
          success: false, 
          message: "Countdown not found" 
        });
      }

      res.json({ success: true, data: countdown });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Update countdown
  async updateCountdown(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validate end date if provided
      if (updateData.endDate) {
        const endDate = new Date(updateData.endDate);
        if (endDate <= new Date()) {
          return res.status(400).json({
            success: false,
            message: "End date must be in the future"
          });
        }
      }

      const countdown = await countdownService.updateCountdown(id, updateData);
      
      if (!countdown) {
        return res.status(404).json({ 
          success: false, 
          message: "Countdown not found" 
        });
      }

      res.json({
        success: true,
        message: "Countdown updated successfully",
        data: countdown,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Toggle countdown status
  async toggleCountdownStatus(req: Request, res: Response) {
    try {
      const countdown = await countdownService.toggleCountdownStatus(req.params.id);
      
      if (!countdown) {
        return res.status(404).json({ 
          success: false, 
          message: "Countdown not found" 
        });
      }

      res.json({
        success: true,
        message: `Countdown ${countdown.isActive ? "activated" : "deactivated"}`,
        data: countdown,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Delete countdown
  async deleteCountdown(req: Request, res: Response) {
    try {
      await countdownService.deleteCountdown(req.params.id);
      res.json({ 
        success: true, 
        message: "Countdown deleted successfully" 
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Get statistics
  async getStats(req: Request, res: Response) {
    try {
      const stats = await countdownService.getCountdownStats();
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const countdownController = new CountdownController();