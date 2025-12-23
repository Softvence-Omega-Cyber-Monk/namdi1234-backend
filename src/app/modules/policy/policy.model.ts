import mongoose, { Schema, Document } from 'mongoose';
import { IPolicy, PolicyType } from './policy.interface';

// Define instance methods interface
interface IPolicyMethods {
  addVersion(content: string, createdBy: string): void;
}

// Define virtuals interface
interface IPolicyVirtuals {
  currentVersion: number;
}

// Export the complete document type
export type PolicyDocument = Document<unknown, {}, IPolicy> & 
  IPolicy & 
  IPolicyMethods & 
  IPolicyVirtuals &
  Required<{ _id: unknown }> & 
  { __v: number };

const policyVersionSchema = new Schema({
  version: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const policySchema = new Schema<IPolicy, mongoose.Model<IPolicy, {}, IPolicyMethods>, IPolicyMethods>(
  {
    type: {
      type: String,
      enum: Object.values(PolicyType),
      required: [true, 'Policy type is required'],
      unique: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    contentFormat: {
      type: String,
      enum: ['plain', 'html'],
      default: 'html'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    versions: {
      type: [policyVersionSchema],
      default: []
    },
    lastUpdatedBy: {
      type: String
    },
    metaDescription: {
      type: String,
      maxlength: [300, 'Meta description cannot exceed 300 characters']
    },
    metaKeywords: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
policySchema.index({ type: 1 });
policySchema.index({ slug: 1 });
policySchema.index({ isActive: 1 });
policySchema.index({ createdAt: -1 });

// Generate slug from type before validation
policySchema.pre('validate', function(next) {
  if (!this.slug) {
    this.slug = this.type
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Method to add version history
policySchema.methods.addVersion = function(content: string, createdBy: string) {
  const version = this.versions.length + 1;
  
  // Deactivate all previous versions
  this.versions.forEach((v: any) => {
    v.isActive = false;
  });
  
  // Add new version
  this.versions.push({
    version,
    content,
    createdBy,
    createdAt: new Date(),
    isActive: true
  });
};

// Virtual for current version number
policySchema.virtual('currentVersion').get(function() {
  return this.versions.length;
});

export const PolicyModel = mongoose.model<IPolicy, mongoose.Model<IPolicy, {}, IPolicyMethods>>('Policy', policySchema);