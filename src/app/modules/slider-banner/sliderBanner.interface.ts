import { Document, Schema } from "mongoose";

export enum SliderLocation {
  HOME_PRIMARY = "home_primary_slider",
  HOME_SECONDARY = "home_secondary_slider",
}

export enum BannerLocation {
  HOME_PAGE = "home_page_banner",
  CATALOGUE_PAGE = "catalogue_page_banner",
  BANNER_LIST_1 = "banner_list_1",
  BANNER_LIST_2 = "banner_list_2",
}

export interface ISlider extends Document {
  images: string[]; // Changed from single imageUrl to array of images
  title?: string;
  location: SliderLocation;
  order: number;
  isActive: boolean;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBanner extends Document {
  imageUrl: string;
  title?: string;
  location: BannerLocation;
  position: 'top' | 'middle' | 'bottom' | 'sidebar';
  order: number;
  isActive: boolean;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}