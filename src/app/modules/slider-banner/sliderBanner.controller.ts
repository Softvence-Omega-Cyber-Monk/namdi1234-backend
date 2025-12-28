import { Request, Response } from "express";
import { sliderBannerService } from "./sliderBanner.service";
import { uploadToCloudinary } from "../../../utils/cloudinaryUpload";
import fs from "fs";

class SliderBannerController {
  // ===========================
  // SLIDER CONTROLLERS
  // ===========================

  async createSlider(req: Request, res: Response) {
    try {
      const createdBy = (req as any).user.id;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one image is required",
        });
      }

      // Upload all images to Cloudinary
      const imageUploadPromises = files.map((file) => uploadToCloudinary(file.path));
      const imageUrls = await Promise.all(imageUploadPromises);

      // Safe cleanup of local files
      files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      const sliderData = {
        images: imageUrls,
        title: req.body.title,
        location: req.body.location,
        order: req.body.order ? parseInt(req.body.order) : 0,
        isActive: req.body.isActive !== undefined ? req.body.isActive === "true" : true,
        createdBy,
      };

      const slider = await sliderBannerService.createSlider(sliderData);

      res.status(201).json({
        success: true,
        message: "Slider created successfully",
        data: slider,
      });
    } catch (err: any) {
      console.error("Create Slider Error:", err);
      
      // Safe cleanup on error
      const files = req.files as Express.Multer.File[] || [];
      files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (unlinkErr) {
            console.warn("Failed to clean up temp file:", unlinkErr);
          }
        }
      });

      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getAllSliders(req: Request, res: Response) {
    try {
      const sliders = await sliderBannerService.getAllSliders();
      res.json({ success: true, data: sliders });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getActiveSliders(req: Request, res: Response) {
    try {
      const sliders = await sliderBannerService.getActiveSliders();
      res.json({ success: true, data: sliders });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getSlidersByLocation(req: Request, res: Response) {
    try {
      const { location } = req.params;
      const sliders = await sliderBannerService.getSlidersByLocation(location);
      res.json({ success: true, data: sliders });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getSliderById(req: Request, res: Response) {
    try {
      const slider = await sliderBannerService.getSliderById(req.params.id);
      if (!slider) {
        return res.status(404).json({ success: false, message: "Slider not found" });
      }
      res.json({ success: true, data: slider });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateSlider(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];

      let images: string[] | undefined;
      if (files && files.length > 0) {
        // Upload new images to Cloudinary (replaces existing ones)
        const imageUploadPromises = files.map((file) => uploadToCloudinary(file.path));
        images = await Promise.all(imageUploadPromises);

        // Safe cleanup
        files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      const updateData: any = {
        ...(req.body.title && { title: req.body.title }),
        ...(req.body.location && { location: req.body.location }),
      };

      if (images) {
        updateData.images = images;
      }
      if (req.body.order !== undefined) {
        updateData.order = parseInt(req.body.order);
      }
      if (req.body.isActive !== undefined) {
        updateData.isActive = req.body.isActive === "true";
      }

      const slider = await sliderBannerService.updateSlider(id, updateData);
      if (!slider) {
        return res.status(404).json({ success: false, message: "Slider not found" });
      }

      res.json({
        success: true,
        message: "Slider updated successfully",
        data: slider,
      });
    } catch (err: any) {
      console.error("Update Slider Error:", err);
      
      // Safe cleanup on error
      const files = req.files as Express.Multer.File[] || [];
      files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (unlinkErr) {
            console.warn("Failed to clean up temp file:", unlinkErr);
          }
        }
      });

      res.status(400).json({ success: false, message: err.message });
    }
  }

  async deleteSlider(req: Request, res: Response) {
    try {
      await sliderBannerService.deleteSlider(req.params.id);
      res.json({ success: true, message: "Slider deleted successfully" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async toggleSliderStatus(req: Request, res: Response) {
    try {
      const slider = await sliderBannerService.toggleSliderStatus(req.params.id);
      if (!slider) {
        return res.status(404).json({ success: false, message: "Slider not found" });
      }
      res.json({
        success: true,
        message: `Slider ${slider.isActive ? "activated" : "deactivated"} successfully`,
        data: slider,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateSliderOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { order } = req.body;

      if (order === undefined) {
        return res.status(400).json({
          success: false,
          message: "Order is required",
        });
      }

      const slider = await sliderBannerService.updateSliderOrder(id, parseInt(order));
      if (!slider) {
        return res.status(404).json({ success: false, message: "Slider not found" });
      }

      res.json({
        success: true,
        message: "Slider order updated successfully",
        data: slider,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // ===========================
  // BANNER CONTROLLERS
  // ===========================

  async createBanner(req: Request, res: Response) {
    try {
      const createdBy = (req as any).user.id;
      const file = req.file as Express.Multer.File;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "Image is required",
        });
      }

      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file.path);

      // Safe cleanup
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      const bannerData = {
        imageUrl,
        title: req.body.title,
        location: req.body.location,
        position: req.body.position || "top",
        order: req.body.order ? parseInt(req.body.order) : 0,
        isActive: req.body.isActive !== undefined ? req.body.isActive === "true" : true,
        createdBy,
      };

      const banner = await sliderBannerService.createBanner(bannerData);

      res.status(201).json({
        success: true,
        message: "Banner created successfully",
        data: banner,
      });
    } catch (err: any) {
      console.error("Create Banner Error:", err);
      
      // Safe cleanup on error
      const file = req.file as Express.Multer.File;
      if (file && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkErr) {
          console.warn("Failed to clean up temp file:", unlinkErr);
        }
      }

      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getAllBanners(req: Request, res: Response) {
    try {
      const banners = await sliderBannerService.getAllBanners();
      res.json({ success: true, data: banners });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getActiveBanners(req: Request, res: Response) {
    try {
      const banners = await sliderBannerService.getActiveBanners();
      res.json({ success: true, data: banners });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getBannersByPosition(req: Request, res: Response) {
    try {
      const { position } = req.params;
      const banners = await sliderBannerService.getBannersByPosition(position);
      res.json({ success: true, data: banners });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getBannersByLocation(req: Request, res: Response) {
    try {
      const { location } = req.params;
      const banners = await sliderBannerService.getBannersByLocation(location);
      res.json({ success: true, data: banners });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getBannerById(req: Request, res: Response) {
    try {
      const banner = await sliderBannerService.getBannerById(req.params.id);
      if (!banner) {
        return res.status(404).json({ success: false, message: "Banner not found" });
      }
      res.json({ success: true, data: banner });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateBanner(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const file = req.file as Express.Multer.File;

      let imageUrl: string | undefined;
      if (file) {
        imageUrl = await uploadToCloudinary(file.path);
        
        // Safe cleanup
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }

      const updateData: any = {
        ...(req.body.title && { title: req.body.title }),
        ...(req.body.location && { location: req.body.location }),
        ...(req.body.position && { position: req.body.position }),
      };

      if (imageUrl) {
        updateData.imageUrl = imageUrl;
      }
      if (req.body.order !== undefined) {
        updateData.order = parseInt(req.body.order);
      }
      if (req.body.isActive !== undefined) {
        updateData.isActive = req.body.isActive === "true";
      }

      const banner = await sliderBannerService.updateBanner(id, updateData);
      if (!banner) {
        return res.status(404).json({ success: false, message: "Banner not found" });
      }

      res.json({
        success: true,
        message: "Banner updated successfully",
        data: banner,
      });
    } catch (err: any) {
      console.error("Update Banner Error:", err);
      
      // Safe cleanup on error
      const file = req.file as Express.Multer.File;
      if (file && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkErr) {
          console.warn("Failed to clean up temp file:", unlinkErr);
        }
      }

      res.status(400).json({ success: false, message: err.message });
    }
  }

  async deleteBanner(req: Request, res: Response) {
    try {
      await sliderBannerService.deleteBanner(req.params.id);
      res.json({ success: true, message: "Banner deleted successfully" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async toggleBannerStatus(req: Request, res: Response) {
    try {
      const banner = await sliderBannerService.toggleBannerStatus(req.params.id);
      if (!banner) {
        return res.status(404).json({ success: false, message: "Banner not found" });
      }
      res.json({
        success: true,
        message: `Banner ${banner.isActive ? "activated" : "deactivated"} successfully`,
        data: banner,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateBannerOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { order } = req.body;

      if (order === undefined) {
        return res.status(400).json({
          success: false,
          message: "Order is required",
        });
      }

      const banner = await sliderBannerService.updateBannerOrder(id, parseInt(order));
      if (!banner) {
        return res.status(404).json({ success: false, message: "Banner not found" });
      }

      res.json({
        success: true,
        message: "Banner order updated successfully",
        data: banner,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

export const sliderBannerController = new SliderBannerController();