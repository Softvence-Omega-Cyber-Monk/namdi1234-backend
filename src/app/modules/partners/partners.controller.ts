import { Request, Response } from "express";
import { partnerService } from "./partners.service";
import { ICreatePartner, IUpdatePartner, IPartnerFilters } from "./partners.interface";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class PartnerController {
  /**
   * Create a new partner company (Admin/Vendor only)
   */
  createPartner = async (req: Request, res: Response): Promise<void> => {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({ 
          success: false, 
          message: "Logo image is required" 
        });
        return;
      }

      const { companyName, website, description, displayOrder } = req.body;

      if (!companyName) {
        res.status(400).json({ 
          success: false, 
          message: "Company name is required" 
        });
        return;
      }

      const data: ICreatePartner = {
        companyName,
        website,
        description,
        displayOrder: displayOrder ? parseInt(displayOrder) : undefined,
      };

      const partner = await partnerService.createPartner(data, file.path);

      res.status(201).json({ 
        success: true, 
        message: "Partner company created successfully", 
        data: partner 
      });
    } catch (error: any) {
      console.error("Error creating partner:", error.message);
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  };

  /**
   * Get all partners (Admin only)
   */
  getAllPartners = async (req: Request, res: Response): Promise<void> => {
    try {
      const { isActive, searchTerm } = req.query;

      const filters: IPartnerFilters = {};

      if (isActive !== undefined) {
        filters.isActive = isActive === "true";
      }

      if (searchTerm) {
        filters.searchTerm = searchTerm as string;
      }

      const partners = await partnerService.getAllPartners(filters);

      res.status(200).json({ 
        success: true, 
        count: partners.length,
        data: partners 
      });
    } catch (error: any) {
      console.error("Error fetching partners:", error.message);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch partners" 
      });
    }
  };

  /**
   * Get active partners (Public endpoint)
   */
  getActivePartners = async (req: Request, res: Response): Promise<void> => {
    try {
      const partners = await partnerService.getActivePartners();

      res.status(200).json({ 
        success: true, 
        count: partners.length,
        data: partners 
      });
    } catch (error: any) {
      console.error("Error fetching active partners:", error.message);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch active partners" 
      });
    }
  };

  /**
   * Get partner by ID
   */
  getPartnerById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const partner = await partnerService.getPartnerById(id);

      if (!partner) {
        res.status(404).json({ 
          success: false, 
          message: "Partner not found" 
        });
        return;
      }

      res.status(200).json({ 
        success: true, 
        data: partner 
      });
    } catch (error: any) {
      console.error("Error fetching partner:", error.message);
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  };

  /**
   * Update partner (Admin/Vendor only)
   */
  updatePartner = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const file = req.file;
      const { companyName, website, description, isActive, displayOrder } = req.body;

      const data: IUpdatePartner = {};

      if (companyName !== undefined) data.companyName = companyName;
      if (website !== undefined) data.website = website;
      if (description !== undefined) data.description = description;
      if (isActive !== undefined) data.isActive = isActive === "true" || isActive === true;
      if (displayOrder !== undefined) data.displayOrder = parseInt(displayOrder);

      const partner = await partnerService.updatePartner(id, data, file?.path);

      res.status(200).json({ 
        success: true, 
        message: "Partner updated successfully", 
        data: partner 
      });
    } catch (error: any) {
      console.error("Error updating partner:", error.message);
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  };

  /**
   * Delete partner (Admin only)
   */
  deletePartner = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await partnerService.deletePartner(id);

      res.status(200).json({ 
        success: true, 
        message: "Partner deleted successfully" 
      });
    } catch (error: any) {
      console.error("Error deleting partner:", error.message);
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  };

  /**
   * Toggle partner active status (Admin/Vendor only)
   */
  togglePartnerStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const partner = await partnerService.togglePartnerStatus(id);

      res.status(200).json({ 
        success: true, 
        message: `Partner ${partner.isActive ? "activated" : "deactivated"} successfully`, 
        data: partner 
      });
    } catch (error: any) {
      console.error("Error toggling partner status:", error.message);
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  };

  /**
   * Reorder partners (Admin/Vendor only)
   */
  reorderPartners = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderData } = req.body;

      if (!Array.isArray(orderData)) {
        res.status(400).json({ 
          success: false, 
          message: "orderData must be an array" 
        });
        return;
      }

      await partnerService.reorderPartners(orderData);

      res.status(200).json({ 
        success: true, 
        message: "Partners reordered successfully" 
      });
    } catch (error: any) {
      console.error("Error reordering partners:", error.message);
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  };

  /**
   * Get partners count (Admin only)
   */
  getPartnersCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { isActive } = req.query;
      
      const count = await partnerService.getPartnersCount(
        isActive !== undefined ? isActive === "true" : undefined
      );

      res.status(200).json({ 
        success: true, 
        data: { count } 
      });
    } catch (error: any) {
      console.error("Error counting partners:", error.message);
      res.status(500).json({ 
        success: false, 
        message: "Failed to count partners" 
      });
    }
  };
}

export const partnerController = new PartnerController();