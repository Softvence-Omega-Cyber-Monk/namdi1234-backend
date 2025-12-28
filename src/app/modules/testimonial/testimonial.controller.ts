// src/app/modules/testimonial/testimonial.controller.ts
import { Request, Response } from "express";
import { testimonialService } from "./testimonial.service";

class TestimonialController {
  // Testimonials
  async createTestimonial(req: Request, res: Response) {
    try {
      const createdBy = (req as any).user.id;
      const { customerName, rating, review } = req.body;

      if (!customerName || !rating || !review) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
      }

      const testimonial = await testimonialService.createTestimonial({
        customerName,
        rating: Number(rating),
        review,
        createdBy,
      });

      res.status(201).json({
        success: true,
        message: "Testimonial added successfully",
        data: testimonial,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getAllTestimonials(req: Request, res: Response) {
    try {
      const testimonials = await testimonialService.getAllTestimonials();
      res.json({ success: true, data: testimonials });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getActiveTestimonials(req: Request, res: Response) {
    try {
      const testimonials = await testimonialService.getActiveTestimonials();
      res.json({ success: true, data: testimonials });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getTestimonialById(req: Request, res: Response) {
    try {
      const testimonial = await testimonialService.getTestimonialById(req.params.id);
      if (!testimonial) return res.status(404).json({ success: false, message: "Testimonial not found" });
      res.json({ success: true, data: testimonial });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateTestimonial(req: Request, res: Response) {
    try {
      const { customerName, rating, review, isActive } = req.body;
      const updateData: any = {};

      if (customerName) updateData.customerName = customerName;
      if (review) updateData.review = review;
      if (rating !== undefined) {
        if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: "Rating must be 1-5" });
        updateData.rating = Number(rating);
      }
      if (isActive !== undefined) updateData.isActive = isActive === "true";

      const testimonial = await testimonialService.updateTestimonial(req.params.id, updateData);
      if (!testimonial) return res.status(404).json({ success: false, message: "Testimonial not found" });

      res.json({ success: true, message: "Testimonial updated", data: testimonial });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async toggleTestimonialStatus(req: Request, res: Response) {
    try {
      const testimonial = await testimonialService.toggleTestimonialStatus(req.params.id);
      if (!testimonial) return res.status(404).json({ success: false, message: "Testimonial not found" });
      res.json({
        success: true,
        message: `Testimonial ${testimonial.isActive ? "activated" : "deactivated"}`,
        data: testimonial,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async deleteTestimonial(req: Request, res: Response) {
    try {
      await testimonialService.deleteTestimonial(req.params.id);
      res.json({ success: true, message: "Testimonial deleted" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Marquee
  async createOrUpdateMarquee(req: Request, res: Response) {
    try {
      const { text } = req.body;
      const createdBy = (req as any).user.id;

      if (!text?.trim()) {
        return res.status(400).json({ success: false, message: "Marquee text is required" });
      }

      const marquee = await testimonialService.createOrUpdateMarquee(text.trim(), createdBy);

      res.json({
        success: true,
        message: "Marquee updated successfully",
        data: marquee,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getMarquee(req: Request, res: Response) {
    try {
      const marquee = await testimonialService.getMarquee();
      res.json({ success: true, data: marquee || { text: "" } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getMarqueeAdmin(req: Request, res: Response) {
    try {
      const marquee = await testimonialService.getMarqueeAdmin();
      res.json({ success: true, data: marquee || { text: "" } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const testimonialController = new TestimonialController();