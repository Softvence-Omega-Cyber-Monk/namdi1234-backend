// src/controllers/shipmentCompany.controller.ts

import { Request, Response } from 'express';
import shipmentCompanyService from './shipment.service';
import { IShipmentCompanyQuery } from './shipment.interface';

class ShipmentCompanyController {
  async create(req: Request, res: Response) {
    try {
      const company = await shipmentCompanyService.create(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Shipment company created successfully',
        data: company
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create shipment company'
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const query: IShipmentCompanyQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        isActive: req.query.isActive === 'true' ? true : 
                  req.query.isActive === 'false' ? false : undefined,
        search: req.query.search as string
      };

      const result = await shipmentCompanyService.getAll(query);

      res.status(200).json({
        success: true,
        message: 'Shipment companies retrieved successfully',
        data: result.companies,
        pagination: result.pagination
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve shipment companies'
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const company = await shipmentCompanyService.getById(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Shipment company retrieved successfully',
        data: company
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Shipment company not found'
      });
    }
  }

  async getByCode(req: Request, res: Response) {
    try {
      const company = await shipmentCompanyService.getByCode(req.params.code);

      res.status(200).json({
        success: true,
        message: 'Shipment company retrieved successfully',
        data: company
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Shipment company not found'
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const company = await shipmentCompanyService.update(
        req.params.id,
        req.body
      );

      res.status(200).json({
        success: true,
        message: 'Shipment company updated successfully',
        data: company
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update shipment company'
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const result = await shipmentCompanyService.delete(req.params.id);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Failed to delete shipment company'
      });
    }
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const company = await shipmentCompanyService.toggleStatus(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Shipment company status updated successfully',
        data: company
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Failed to update shipment company status'
      });
    }
  }

  async getActiveCompanies(req: Request, res: Response) {
    try {
      const companies = await shipmentCompanyService.getActiveCompanies();

      res.status(200).json({
        success: true,
        message: 'Active shipment companies retrieved successfully',
        data: companies
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve active shipment companies'
      });
    }
  }
}

export default new ShipmentCompanyController();