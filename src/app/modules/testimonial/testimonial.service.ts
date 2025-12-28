// src/app/modules/testimonial/testimonial.service.ts
import { ITestimonial, IMarquee } from "./testimonial.interface";
import { TestimonialModel, MarqueeModel } from "./testimonial.model";

class TestimonialService {
  // Testimonials
  async createTestimonial(data: Partial<ITestimonial>): Promise<ITestimonial> {
    return await TestimonialModel.create(data);
  }

  async getAllTestimonials(): Promise<ITestimonial[]> {
    return TestimonialModel.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  }

  async getActiveTestimonials(): Promise<ITestimonial[]> {
    return TestimonialModel.find({ isActive: true }).sort({ createdAt: -1 });
  }

  async getTestimonialById(id: string): Promise<ITestimonial | null> {
    return TestimonialModel.findById(id).populate("createdBy", "name email");
  }

  async updateTestimonial(id: string, data: Partial<ITestimonial>): Promise<ITestimonial | null> {
    return TestimonialModel.findByIdAndUpdate(id, data, { new: true })
      .populate("createdBy", "name email");
  }

  async toggleTestimonialStatus(id: string): Promise<ITestimonial | null> {
    const testimonial = await TestimonialModel.findById(id);
    if (!testimonial) return null;
    testimonial.isActive = !testimonial.isActive;
    await testimonial.save();
    return testimonial.populate("createdBy", "name email");
  }

  async deleteTestimonial(id: string): Promise<void> {
    await TestimonialModel.findByIdAndDelete(id);
  }

  // Marquee (only one active)
  async createOrUpdateMarquee(text: string, createdBy: string): Promise<IMarquee> {
    const existing = await MarqueeModel.findOne();
    if (existing) {
      existing.text = text;
      existing.isActive = true;
      existing.createdBy = createdBy as any;
      return await existing.save();
    }
    return await MarqueeModel.create({ text, isActive: true, createdBy });
  }

  async getMarquee(): Promise<IMarquee | null> {
    return MarqueeModel.findOne({ isActive: true });
  }

  async getMarqueeAdmin(): Promise<IMarquee | null> {
    return MarqueeModel.findOne().sort({ updatedAt: -1 });
  }
}

export const testimonialService = new TestimonialService();