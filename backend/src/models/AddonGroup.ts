import mongoose, { Document, Schema } from 'mongoose';

export interface IAddonOption {
  key: string;
  name_en: string;
  name_ar: string;
  price: number;
}

export interface IAddonGroup extends Document {
  venueId: mongoose.Types.ObjectId;
  key: string;
  name_en: string;
  name_ar: string;
  min_select: number;
  max_select: number;
  options: IAddonOption[];
  createdAt: Date;
  updatedAt: Date;
}

const addonGroupSchema = new Schema<IAddonGroup>(
  {
    venueId: { type: Schema.Types.ObjectId, ref: 'Venue', required: true, index: true },
    key: { type: String, required: true },
    name_en: { type: String, required: true },
    name_ar: { type: String, default: '' },
    min_select: { type: Number, default: 0 },
    max_select: { type: Number, default: 1 },
    options: [
      {
        key: { type: String, required: true },
        name_en: { type: String, required: true },
        name_ar: { type: String, default: '' },
        price: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

addonGroupSchema.index({ venueId: 1, key: 1 }, { unique: true });

export default mongoose.model<IAddonGroup>('AddonGroup', addonGroupSchema);
