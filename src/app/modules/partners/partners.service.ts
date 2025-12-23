import { Partner } from "./partners.model";
import { IPartner, ICreatePartner, IUpdatePartner, IPartnerFilters } from "./partners.interface";
import { cloudinary } from "../../config/cloudinary.config";
import fs from "fs";

export class PartnerService {
  /**
   * Create a new partner company
   */
  async createPartner(data: ICreatePartner, filePath: string): Promise<IPartner> {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "partners",
    });

    // delete file from local after upload
    fs.unlinkSync(filePath);

    // Get the highest display order
    const lastPartner = await Partner.findOne().sort({ displayOrder: -1 });
    const displayOrder = data.displayOrder ?? (lastPartner ? lastPartner.displayOrder + 1 : 0);

    return Partner.create({
      companyName: data.companyName,
      logoUrl: result.secure_url,
      cloudinaryId: result.public_id,
      website: data.website,
      description: data.description,
      displayOrder,
      isActive: true,
    });
  }

  /**
   * Get all partners with optional filters
   */
  async getAllPartners(filters?: IPartnerFilters): Promise<IPartner[]> {
    const query: any = {};

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters?.searchTerm) {
      query.$or = [
        { companyName: { $regex: filters.searchTerm, $options: "i" } },
        { description: { $regex: filters.searchTerm, $options: "i" } },
      ];
    }

    return Partner.find(query).sort({ displayOrder: 1, createdAt: -1 });
  }

  /**
   * Get active partners only (for public display)
   */
  async getActivePartners(): Promise<IPartner[]> {
    return Partner.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .select("companyName logoUrl website description displayOrder");
  }

  /**
   * Get partner by ID
   */
  async getPartnerById(id: string): Promise<IPartner | null> {
    return Partner.findById(id);
  }

  /**
   * Update partner
   */
  async updatePartner(
    id: string, 
    data: IUpdatePartner, 
    filePath?: string
  ): Promise<IPartner | null> {
    const partner = await Partner.findById(id);
    if (!partner) throw new Error("Partner not found");

    if (filePath) {
      // delete old logo from cloudinary
      await cloudinary.uploader.destroy(partner.cloudinaryId);

      // upload new logo
      const result = await cloudinary.uploader.upload(filePath, { folder: "partners" });
      fs.unlinkSync(filePath);

      partner.logoUrl = result.secure_url;
      partner.cloudinaryId = result.public_id;
    }

    // Update other fields
    if (data.companyName !== undefined) partner.companyName = data.companyName;
    if (data.website !== undefined) partner.website = data.website;
    if (data.description !== undefined) partner.description = data.description;
    if (data.isActive !== undefined) partner.isActive = data.isActive;
    if (data.displayOrder !== undefined) partner.displayOrder = data.displayOrder;

    await partner.save();
    return partner;
  }

  /**
   * Delete partner
   */
  async deletePartner(id: string): Promise<void> {
    const partner = await Partner.findById(id);
    if (!partner) throw new Error("Partner not found");

    await cloudinary.uploader.destroy(partner.cloudinaryId);
    await Partner.findByIdAndDelete(id);
  }

  /**
   * Toggle partner active status
   */
  async togglePartnerStatus(id: string): Promise<IPartner> {
    const partner = await Partner.findById(id);
    if (!partner) throw new Error("Partner not found");

    partner.isActive = !partner.isActive;
    await partner.save();

    return partner;
  }

  /**
   * Reorder partners
   */
  async reorderPartners(orderData: { id: string; displayOrder: number }[]): Promise<void> {
    const bulkOps = orderData.map(({ id, displayOrder }) => ({
      updateOne: {
        filter: { _id: id },
        update: { displayOrder },
      },
    }));

    await Partner.bulkWrite(bulkOps);
  }

  /**
   * Get partners count
   */
  async getPartnersCount(isActive?: boolean): Promise<number> {
    const query = isActive !== undefined ? { isActive } : {};
    return Partner.countDocuments(query);
  }
}

export const partnerService = new PartnerService();