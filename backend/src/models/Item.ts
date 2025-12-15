import mongoose, { Document, Schema } from 'mongoose';

export interface IItem extends Document {
  venueId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  key: string;
  name_en: string;
  name_ar: string;
  price: number;
  imageUrl?: string;
  ingredients_en: string[];
  ingredients_ar: string[];
  tags: string[];
  isHidden: boolean;
  isUnavailable: boolean;
  addons: string[]; // addon group keys
  nutrition: {
    calories_kcal?: number;
    carbs_g?: number;
    protein_g?: number;
    fiber_g?: number;
    fat_g?: number;
    micros_en?: string[];
    micros_ar?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IItem>(
  {
    venueId: { type: Schema.Types.ObjectId, ref: 'Venue', required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    key: { type: String, required: true },
    name_en: { type: String, required: true },
    name_ar: { type: String, default: '' },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    ingredients_en: [{ type: String }],
    ingredients_ar: [{ type: String }],
    tags: [{ type: String }],
    isHidden: { type: Boolean, default: false },
    isUnavailable: { type: Boolean, default: false },
    addons: [{ type: String }],
    nutrition: {
      calories_kcal: { type: Number },
      carbs_g: { type: Number },
      protein_g: { type: Number },
      fiber_g: { type: Number },
      fat_g: { type: Number },
      micros_en: [{ type: String }],
      micros_ar: [{ type: String }],
    },
  },
  { timestamps: true }
);

itemSchema.index({ venueId: 1, key: 1 }, { unique: true });
itemSchema.index({ name_en: 'text', ingredients_en: 'text' });

export default mongoose.model<IItem>('Item', itemSchema);
