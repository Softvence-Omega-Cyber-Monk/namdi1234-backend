import { PolicyModel } from './policy.model';
import { IPolicy, ICreatePolicy, IUpdatePolicy, IPolicyFilters, PolicyType } from './policy.interface';
import DOMPurify from 'isomorphic-dompurify';

export class PolicyService {
  /**
   * Create a new policy
   */
  async createPolicy(data: ICreatePolicy, createdBy: string): Promise<IPolicy> {
    try {
      // Check if policy with this type already exists
      const existingPolicy = await PolicyModel.findOne({ type: data.type });
      
      if (existingPolicy) {
        throw new Error(`Policy of type "${data.type}" already exists`);
      }

      // Sanitize HTML content if format is HTML
      let sanitizedContent = data.content;
      if (data.contentFormat === 'html') {
        sanitizedContent = this.sanitizeHtml(data.content);
      }

      const policy = new PolicyModel({
        type: data.type,
        title: data.title,
        content: sanitizedContent,
        contentFormat: data.contentFormat || 'html',
        isActive: true,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        lastUpdatedBy: createdBy,
        versions: [{
          version: 1,
          content: sanitizedContent,
          createdBy,
          createdAt: new Date(),
          isActive: true
        }]
      });

      await policy.save();
      return policy;
    } catch (error: any) {
      console.error('Error creating policy:', error.message);
      throw error;
    }
  }

  /**
   * Get all policies with optional filters
   */
  async getAllPolicies(filters?: IPolicyFilters): Promise<IPolicy[]> {
    try {
      const query: any = {};

      if (filters?.type) {
        query.type = filters.type;
      }

      if (filters?.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      if (filters?.searchTerm) {
        query.$or = [
          { title: { $regex: filters.searchTerm, $options: 'i' } },
          { content: { $regex: filters.searchTerm, $options: 'i' } }
        ];
      }

      return await PolicyModel.find(query).sort({ createdAt: -1 });
    } catch (error: any) {
      console.error('Error fetching policies:', error.message);
      throw new Error('Failed to fetch policies');
    }
  }

  /**
   * Get policy by ID
   */
  async getPolicyById(policyId: string): Promise<IPolicy | null> {
    try {
      return await PolicyModel.findById(policyId);
    } catch (error: any) {
      console.error('Error fetching policy:', error.message);
      throw new Error('Failed to fetch policy');
    }
  }

  /**
   * Get policy by type
   */
  async getPolicyByType(type: PolicyType): Promise<IPolicy | null> {
    try {
      return await PolicyModel.findOne({ type, isActive: true });
    } catch (error: any) {
      console.error('Error fetching policy by type:', error.message);
      throw new Error('Failed to fetch policy');
    }
  }

  /**
   * Get policy by slug
   */
  async getPolicyBySlug(slug: string): Promise<IPolicy | null> {
    try {
      return await PolicyModel.findOne({ slug, isActive: true });
    } catch (error: any) {
      console.error('Error fetching policy by slug:', error.message);
      throw new Error('Failed to fetch policy');
    }
  }

  /**
   * Update policy
   */
  async updatePolicy(policyId: string, data: IUpdatePolicy, updatedBy: string): Promise<IPolicy> {
    try {
      const policy = await PolicyModel.findById(policyId);

      if (!policy) {
        throw new Error('Policy not found');
      }

      // If content is being updated, create a new version
      if (data.content && data.content !== policy.content) {
        let sanitizedContent = data.content;
        
        if (data.contentFormat === 'html' || policy.contentFormat === 'html') {
          sanitizedContent = this.sanitizeHtml(data.content);
        }

        policy.addVersion(sanitizedContent, updatedBy);
        policy.content = sanitizedContent;
      }

      // Update other fields
      if (data.title !== undefined) policy.title = data.title;
      if (data.contentFormat !== undefined) policy.contentFormat = data.contentFormat;
      if (data.isActive !== undefined) policy.isActive = data.isActive;
      if (data.metaDescription !== undefined) policy.metaDescription = data.metaDescription;
      if (data.metaKeywords !== undefined) policy.metaKeywords = data.metaKeywords;

      policy.lastUpdatedBy = updatedBy;

      await policy.save();
      return policy;
    } catch (error: any) {
      console.error('Error updating policy:', error.message);
      throw error;
    }
  }

  /**
   * Delete policy
   */
  async deletePolicy(policyId: string): Promise<IPolicy | null> {
    try {
      const policy = await PolicyModel.findByIdAndDelete(policyId);
      
      if (!policy) {
        throw new Error('Policy not found');
      }

      return policy;
    } catch (error: any) {
      console.error('Error deleting policy:', error.message);
      throw error;
    }
  }

  /**
   * Toggle policy active status
   */
  async togglePolicyStatus(policyId: string): Promise<IPolicy> {
    try {
      const policy = await PolicyModel.findById(policyId);

      if (!policy) {
        throw new Error('Policy not found');
      }

      policy.isActive = !policy.isActive;
      await policy.save();

      return policy;
    } catch (error: any) {
      console.error('Error toggling policy status:', error.message);
      throw error;
    }
  }

  /**
   * Get policy version history
   */
  async getPolicyVersionHistory(policyId: string): Promise<any[]> {
    try {
      const policy = await PolicyModel.findById(policyId);

      if (!policy) {
        throw new Error('Policy not found');
      }

      return policy.versions.sort((a, b) => b.version - a.version);
    } catch (error: any) {
      console.error('Error fetching policy versions:', error.message);
      throw new Error('Failed to fetch policy versions');
    }
  }

  /**
   * Restore specific version
   */
  async restorePolicyVersion(policyId: string, versionNumber: number, restoredBy: string): Promise<IPolicy> {
    try {
      const policy = await PolicyModel.findById(policyId);

      if (!policy) {
        throw new Error('Policy not found');
      }

      const version = policy.versions.find(v => v.version === versionNumber);

      if (!version) {
        throw new Error('Version not found');
      }

      // Create new version with restored content
      policy.addVersion(version.content, restoredBy);
      policy.content = version.content;
      policy.lastUpdatedBy = restoredBy;

      await policy.save();
      return policy;
    } catch (error: any) {
      console.error('Error restoring policy version:', error.message);
      throw error;
    }
  }

  /**
   * Get all active policies for frontend
   */
  async getActivePolicies(): Promise<IPolicy[]> {
    try {
      return await PolicyModel.find({ isActive: true })
        .select('type slug title content contentFormat metaDescription metaKeywords updatedAt')
        .sort({ type: 1 });
    } catch (error: any) {
      console.error('Error fetching active policies:', error.message);
      throw new Error('Failed to fetch active policies');
    }
  }

  /**
   * Search policies
   */
  async searchPolicies(searchTerm: string): Promise<IPolicy[]> {
    try {
      return await PolicyModel.find({
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { content: { $regex: searchTerm, $options: 'i' } },
          { type: { $regex: searchTerm, $options: 'i' } }
        ],
        isActive: true
      }).select('type slug title metaDescription updatedAt');
    } catch (error: any) {
      console.error('Error searching policies:', error.message);
      throw new Error('Failed to search policies');
    }
  }

  /**
   * Sanitize HTML content
   */
  private sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'span', 'div',
        'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'hr'
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel', 'class', 'id', 'src', 'alt', 'title', 'style'
      ],
      ALLOW_DATA_ATTR: false
    });
  }

  /**
   * Initialize default policies (can be called during app setup)
   */
  async initializeDefaultPolicies(createdBy: string): Promise<void> {
    try {
      const policyTypes = Object.values(PolicyType);

      for (const type of policyTypes) {
        const exists = await PolicyModel.findOne({ type });
        
        if (!exists) {
          await this.createPolicy({
            type,
            title: type,
            content: `<p>This is the default ${type}. Please update this content.</p>`,
            contentFormat: 'html',
            metaDescription: `${type} for MDItems`
          }, createdBy);
        }
      }

      console.log('Default policies initialized successfully');
    } catch (error: any) {
      console.error('Error initializing default policies:', error.message);
    }
  }
}

export const policyService = new PolicyService();