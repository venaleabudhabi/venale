import mongoose, { Document, Schema } from 'mongoose';

export interface IVenue extends Document {
  slug: string;
  name_en: string;
  name_ar: string;
  currency: string;
  languages: string[];
  payment_methods: ('COD' | 'CARD')[];
  delivery_enabled: boolean;
  vatPercent: number;
  deliveryFee: number;
  minOrder: number;
  member_discount_percent: number;
  member_discount_note_en: string;
  member_discount_note_ar: string;
  loyalty_note_en: string;
  loyalty_note_ar: string;
  createdAt: Date;
  updatedAt: Date;
}

const venueSchema = new Schema<IVenue>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name_en: { type: String, required: true },
    name_ar: { type: String, default: '' },
    currency: { type: String, default: 'AED' },
    languages: [{ type: String }],
    payment_methods: [{ type: String, enum: ['COD', 'CARD'] }],
    delivery_enabled: { type: Boolean, default: false },
    vatPercent: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    minOrder: { type: Number, default: 0 },
    member_discount_percent: { type: Number, default: 0 },
    member_discount_note_en: { type: String, default: '' },
    member_discount_note_ar: { type: String, default: '' },
    loyalty_note_en: { type: String, default: '' },
    loyalty_note_ar: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IVenue>('Venue', venueSchema);
