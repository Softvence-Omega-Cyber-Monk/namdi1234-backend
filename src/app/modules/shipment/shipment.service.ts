// src/services/shipmentCompany.service.ts

import ShipmentCompany from './shipment.model';
import {
  IShipmentCompanyCreate,
  IShipmentCompanyUpdate,
  IShipmentCompanyQuery
} from './shipment.interface';

class ShipmentCompanyService {
  async create(data: IShipmentCompanyCreate) {
    try {
      const company = await ShipmentCompany.create(data);
      return company;
    } catch (error: any) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new Error(`Shipment company with this ${field} already exists`);
      }
      throw error;
    }
  }

  async getAll(query: IShipmentCompanyQuery) {
    const { page = 1, limit = 10, isActive, search } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const [companies, total] = await Promise.all([
      ShipmentCompany.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ShipmentCompany.countDocuments(filter)
    ]);

    return {
      companies,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getById(id: string) {
    const company = await ShipmentCompany.findById(id).lean();
    if (!company) {
      throw new Error('Shipment company not found');
    }
    return company;
  }

  async getByCode(code: string) {
    const company = await ShipmentCompany.findOne({ code: code.toUpperCase() }).lean();
    if (!company) {
      throw new Error('Shipment company not found');
    }
    return company;
  }

  async update(id: string, data: IShipmentCompanyUpdate) {
    try {
      const company = await ShipmentCompany.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!company) {
        throw new Error('Shipment company not found');
      }

      return company;
    } catch (error: any) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new Error(`Shipment company with this ${field} already exists`);
      }
      throw error;
    }
  }

  async delete(id: string) {
    const company = await ShipmentCompany.findByIdAndDelete(id);
    if (!company) {
      throw new Error('Shipment company not found');
    }
    return { message: 'Shipment company deleted successfully' };
  }

  async toggleStatus(id: string) {
    const company = await ShipmentCompany.findById(id);
    if (!company) {
      throw new Error('Shipment company not found');
    }

    company.isActive = !company.isActive;
    await company.save();

    return company;
  }

  async getActiveCompanies() {
    const companies = await ShipmentCompany.find({ isActive: true })
      .select('name code logo trackingUrl')
      .sort({ name: 1 })
      .lean();
    
    return companies;
  }
}

export default new ShipmentCompanyService();