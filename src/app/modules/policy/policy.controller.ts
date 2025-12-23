import { Request, Response } from 'express';
import { policyService } from './policy.service';
import { ICreatePolicy, IUpdatePolicy, IPolicyFilters, PolicyType } from './policy.interface';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
}

export class PolicyController {
  /**
   * Create a new policy (Admin only)
   */
  createPolicy = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const createdBy = req.user?.name || req.user?.email || req.user?.id || 'Admin';
      
      const data: ICreatePolicy = req.body;

      if (!data.type || !data.title || !data.content) {
        res.status(400).json({
          success: false,
          error: 'Type, title, and content are required'
        });
        return;
      }

      const policy = await policyService.createPolicy(data, createdBy);

      res.status(201).json({
        success: true,
        message: 'Policy created successfully',
        data: policy
      });
    } catch (error: any) {
      console.error('Error creating policy:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * Get all policies (Admin only)
   */
  getAllPolicies = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { type, isActive, searchTerm } = req.query;

      const filters: IPolicyFilters = {};

      if (type) filters.type = type as PolicyType;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (searchTerm) filters.searchTerm = searchTerm as string;

      const policies = await policyService.getAllPolicies(filters);

      res.status(200).json({
        success: true,
        count: policies.length,
        data: policies
      });
    } catch (error: any) {
      console.error('Error fetching policies:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch policies'
      });
    }
  };

  /**
   * Get policy by ID
   */
  getPolicyById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const policy = await policyService.getPolicyById(id);

      if (!policy) {
        res.status(404).json({
          success: false,
          error: 'Policy not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: policy
      });
    } catch (error: any) {
      console.error('Error fetching policy:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch policy'
      });
    }
  };

  /**
   * Get policy by type (Public endpoint)
   */
  getPolicyByType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type } = req.params;

      const policy = await policyService.getPolicyByType(type as PolicyType);

      if (!policy) {
        res.status(404).json({
          success: false,
          error: 'Policy not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: policy
      });
    } catch (error: any) {
      console.error('Error fetching policy by type:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch policy'
      });
    }
  };

  /**
   * Get policy by slug (Public endpoint)
   */
  getPolicyBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params;

      const policy = await policyService.getPolicyBySlug(slug);

      if (!policy) {
        res.status(404).json({
          success: false,
          error: 'Policy not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: policy
      });
    } catch (error: any) {
      console.error('Error fetching policy by slug:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch policy'
      });
    }
  };

  /**
   * Update policy (Admin only)
   */
  updatePolicy = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updatedBy = req.user?.name || req.user?.email || req.user?.id || 'Admin';
      
      const data: IUpdatePolicy = req.body;

      const policy = await policyService.updatePolicy(id, data, updatedBy);

      res.status(200).json({
        success: true,
        message: 'Policy updated successfully',
        data: policy
      });
    } catch (error: any) {
      console.error('Error updating policy:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * Delete policy (Admin only)
   */
  deletePolicy = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      await policyService.deletePolicy(id);

      res.status(200).json({
        success: true,
        message: 'Policy deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting policy:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * Toggle policy status (Admin only)
   */
  togglePolicyStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const policy = await policyService.togglePolicyStatus(id);

      res.status(200).json({
        success: true,
        message: `Policy ${policy.isActive ? 'activated' : 'deactivated'} successfully`,
        data: policy
      });
    } catch (error: any) {
      console.error('Error toggling policy status:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * Get policy version history (Admin only)
   */
  getPolicyVersionHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const versions = await policyService.getPolicyVersionHistory(id);

      res.status(200).json({
        success: true,
        count: versions.length,
        data: versions
      });
    } catch (error: any) {
      console.error('Error fetching policy versions:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch policy versions'
      });
    }
  };

  /**
   * Restore policy version (Admin only)
   */
  restorePolicyVersion = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { versionNumber } = req.body;
      const restoredBy = req.user?.name || req.user?.email || req.user?.id || 'Admin';

      if (!versionNumber) {
        res.status(400).json({
          success: false,
          error: 'Version number is required'
        });
        return;
      }

      const policy = await policyService.restorePolicyVersion(id, versionNumber, restoredBy);

      res.status(200).json({
        success: true,
        message: 'Policy version restored successfully',
        data: policy
      });
    } catch (error: any) {
      console.error('Error restoring policy version:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * Get all active policies (Public endpoint)
   */
  getActivePolicies = async (req: Request, res: Response): Promise<void> => {
    try {
      const policies = await policyService.getActivePolicies();

      res.status(200).json({
        success: true,
        count: policies.length,
        data: policies
      });
    } catch (error: any) {
      console.error('Error fetching active policies:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch active policies'
      });
    }
  };

  /**
   * Search policies (Public endpoint)
   */
  searchPolicies = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q } = req.query;

      if (!q) {
        res.status(400).json({
          success: false,
          error: 'Search term is required'
        });
        return;
      }

      const policies = await policyService.searchPolicies(q as string);

      res.status(200).json({
        success: true,
        count: policies.length,
        data: policies
      });
    } catch (error: any) {
      console.error('Error searching policies:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to search policies'
      });
    }
  };

  /**
   * Initialize default policies (Admin only)
   */
  initializeDefaultPolicies = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const createdBy = req.user?.name || req.user?.email || req.user?.id || 'Admin';

      await policyService.initializeDefaultPolicies(createdBy);

      res.status(200).json({
        success: true,
        message: 'Default policies initialized successfully'
      });
    } catch (error: any) {
      console.error('Error initializing default policies:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to initialize default policies'
      });
    }
  };
}

export const policyController = new PolicyController();