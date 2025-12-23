// src/models/cms.model.ts
import mongoose, { Schema, Document } from 'mongoose';

// Topbar CMS Interface
export interface ITopbar extends Document {
  backgroundColor: string;
  textColor: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Hero CMS Interface
export interface IHero extends Document {
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  overlayOpacity: number;
  createdAt: Date;
  updatedAt: Date;
}

// Footer CMS Interface
export interface IFooter extends Document {
  logo: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  copyright: string;
  privacyPolicy: string;
  shippingPolicy: string;
  refundPolicy: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Topbar Schema
const TopbarSchema = new Schema<ITopbar>(
  {
    backgroundColor: {
      type: String,
      required: true,
      default: '#000000',
    },
    textColor: {
      type: String,
      required: true,
      default: '#FFFFFF',
    },
    content: {
      type: String,
      required: true,
      default: 'Welcome to MDItems',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hero Schema
const HeroSchema = new Schema<IHero>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      default: 'Start Shopping Now',
    },
    buttonLink: {
      type: String,
      default: '/shop',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    overlayOpacity: {
      type: Number,
      default: 0.6,
      min: 0,
      max: 1,
    },
  },
  { timestamps: true }
);

// Footer Schema
const FooterSchema = new Schema<IFooter>(
  {
    logo: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
    },
    copyright: {
      type: String,
      default: 'MDItems. All rights reserved.',
    },
    privacyPolicy: {
      type: String,
      required: true,
      default: '',
    },
    shippingPolicy: {
      type: String,
      required: true,
      default: '',
    },
    refundPolicy: {
      type: String,
      required: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Topbar = mongoose.model<ITopbar>('Topbar', TopbarSchema);
export const Hero = mongoose.model<IHero>('Hero', HeroSchema);
export const Footer = mongoose.model<IFooter>('Footer', FooterSchema);