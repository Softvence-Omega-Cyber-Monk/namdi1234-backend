import { ISlider, IBanner } from "./sliderBanner.interface";
import { SliderModel, BannerModel } from "./sliderBanner.model";

class SliderBannerService {
  // ===========================
  // SLIDER METHODS
  // ===========================

  async createSlider(data: Partial<ISlider>): Promise<ISlider> {
    const slider = await SliderModel.create(data);
    return slider;
  }

  async getAllSliders(): Promise<ISlider[]> {
    return SliderModel.find()
      .populate("createdBy", "name email")
      .sort({ order: 1 })
      .exec();
  }

  async getActiveSliders(): Promise<ISlider[]> {
    return SliderModel.find({ isActive: true })
      .sort({ order: 1 })
      .exec();
  }

  async getSliderById(id: string): Promise<ISlider | null> {
    return SliderModel.findById(id)
      .populate("createdBy", "name email")
      .exec();
  }

  async updateSlider(id: string, data: Partial<ISlider>): Promise<ISlider | null> {
    return SliderModel.findByIdAndUpdate(id, data, { new: true })
      .populate("createdBy", "name email")
      .exec();
  }

  async deleteSlider(id: string): Promise<void> {
    await SliderModel.findByIdAndDelete(id).exec();
  }

  async toggleSliderStatus(id: string): Promise<ISlider | null> {
    const slider = await SliderModel.findById(id);
    if (!slider) return null;
    
    slider.isActive = !slider.isActive;
    await slider.save();
    return slider.populate("createdBy", "name email");
  }

  async getSlidersByLocation(location: string): Promise<ISlider[]> {
    return SliderModel.find({ location, isActive: true })
      .sort({ order: 1 })
      .exec();
  }

  async updateSliderOrder(sliderId: string, newOrder: number): Promise<ISlider | null> {
    return SliderModel.findByIdAndUpdate(
      sliderId,
      { order: newOrder },
      { new: true }
    )
      .populate("createdBy", "name email")
      .exec();
  }

  // ===========================
  // BANNER METHODS
  // ===========================

  async createBanner(data: Partial<IBanner>): Promise<IBanner> {
    const banner = await BannerModel.create(data);
    return banner;
  }

  async getAllBanners(): Promise<IBanner[]> {
    return BannerModel.find()
      .populate("createdBy", "name email")
      .sort({ position: 1, order: 1 })
      .exec();
  }

  async getActiveBanners(): Promise<IBanner[]> {
    return BannerModel.find({ isActive: true })
      .sort({ position: 1, order: 1 })
      .exec();
  }

  async getBannersByPosition(position: string): Promise<IBanner[]> {
    return BannerModel.find({ position, isActive: true })
      .sort({ order: 1 })
      .exec();
  }

  async getBannersByLocation(location: string): Promise<IBanner[]> {
    return BannerModel.find({ location, isActive: true })
      .sort({ order: 1 })
      .exec();
  }

  async getBannerById(id: string): Promise<IBanner | null> {
    return BannerModel.findById(id)
      .populate("createdBy", "name email")
      .exec();
  }

  async updateBanner(id: string, data: Partial<IBanner>): Promise<IBanner | null> {
    return BannerModel.findByIdAndUpdate(id, data, { new: true })
      .populate("createdBy", "name email")
      .exec();
  }

  async deleteBanner(id: string): Promise<void> {
    await BannerModel.findByIdAndDelete(id).exec();
  }

  async toggleBannerStatus(id: string): Promise<IBanner | null> {
    const banner = await BannerModel.findById(id);
    if (!banner) return null;
    
    banner.isActive = !banner.isActive;
    await banner.save();
    return banner.populate("createdBy", "name email");
  }

  async updateBannerOrder(bannerId: string, newOrder: number): Promise<IBanner | null> {
    return BannerModel.findByIdAndUpdate(
      bannerId,
      { order: newOrder },
      { new: true }
    )
      .populate("createdBy", "name email")
      .exec();
  }
}

export const sliderBannerService = new SliderBannerService();