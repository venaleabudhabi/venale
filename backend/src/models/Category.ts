import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  venueId: mongoose.Types.ObjectId;
  key: string;
  name_en: string;
  name_ar: string;
  sortOrder: number;
  imageUrl: string;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    venueId: { type: Schema.Types.ObjectId, ref: 'Venue', required: true, index: true },
    key: { type: String, required: true },
    name_en: { type: String, required: true },
    name_ar: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

categorySchema.index({ venueId: 1, key: 1 }, { unique: true });

export default mongoose.model<ICategory>('Category', categorySchema);
