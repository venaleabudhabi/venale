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
  isOpen: boolean;
  operatingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
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
    isOpen: { type: Boolean, default: true },
    operatingHours: {
      type: {
        monday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' }, closed: { type: Boolean, default: false } },
        tuesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' }, closed: { type: Boolean, default: false } },
        wednesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' }, closed: { type: Boolean, default: false } },
        thursday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' }, closed: { type: Boolean, default: false } },
        friday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' }, closed: { type: Boolean, default: false } },
        saturday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' }, closed: { type: Boolean, default: false } },
        sunday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' }, closed: { type: Boolean, default: false } }
      },
      default: {
        monday: { open: '09:00', close: '22:00', closed: false },
        tuesday: { open: '09:00', close: '22:00', closed: false },
        wednesday: { open: '09:00', close: '22:00', closed: false },
        thursday: { open: '09:00', close: '22:00', closed: false },
        friday: { open: '09:00', close: '22:00', closed: false },
        saturday: { open: '09:00', close: '22:00', closed: false },
        sunday: { open: '09:00', close: '22:00', closed: false }
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model<IVenue>('Venue', venueSchema);
