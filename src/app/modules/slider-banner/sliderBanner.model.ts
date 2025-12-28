import { model, Schema } from "mongoose";
import { ISlider, IBanner, SliderLocation, BannerLocation } from "./sliderBanner.interface";

const sliderSchema = new Schema<ISlider>(
  {
    images: {
      type: [String],
      required: true,
      validate: {
        validator: function(v: string[]) {
          return v && v.length > 0;
        },
        message: 'At least one image is required'
      }
    },
    title: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      enum: Object.values(SliderLocation),
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const bannerSchema = new Schema<IBanner>(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      enum: Object.values(BannerLocation),
      required: true,
    },
    position: {
      type: String,
      enum: ['top', 'middle', 'bottom', 'sidebar'],
      default: 'top',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const SliderModel = model<ISlider>("Slider", sliderSchema);
export const BannerModel = model<IBanner>("Banner", bannerSchema);