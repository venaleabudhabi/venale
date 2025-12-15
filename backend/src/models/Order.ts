import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface IOrderItem {
  itemKey: string;
  name_en: string;
  name_ar: string;
  price: number;
  qty: number;
  selectedAddons: {
    groupKey: string;
    optionKey: string;
    name_en: string;
    name_ar: string;
    price: number;
  }[];
}

export interface IOrder extends Document {
  venueId: mongoose.Types.ObjectId;
  orderNumber: string;
  channel: 'QR' | 'WEB';
  customer: {
    name?: string;
    phone: string;
  };
  fulfillment: {
    type: 'PICKUP' | 'DELIVERY';
    address?: string;
    notes?: string;
    lat?: number;
    lng?: number;
  };
  payment: {
    method: 'COD' | 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY';
    status: 'PENDING' | 'PAID' | 'FAILED';
    stripeSessionId?: string;
    transactionId?: string;
    paidAt?: Date;
    cardLast4?: string;
    cardBrand?: string;
  };
  items: IOrderItem[];
  totals: {
    subtotal: number;
    vat: number;
    discount: number;
    deliveryFee: number;
    total: number;
  };
  isMember: boolean;
  statusTimeline: {
    status: OrderStatus;
    at: Date;
    by?: mongoose.Types.ObjectId;
  }[];
  currentStatus: OrderStatus;
  assignedDriver?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    venueId: { type: Schema.Types.ObjectId, ref: 'Venue', required: true, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    channel: { type: String, enum: ['QR', 'WEB'], default: 'QR' },
    customer: {
      name: { type: String },
      phone: { type: String, required: true },
    },
    fulfillment: {
      type: { type: String, enum: ['PICKUP', 'DELIVERY'], required: true },
      address: { type: String },
      notes: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
    payment: {
      method: { type: String, enum: ['COD', 'CARD', 'APPLE_PAY', 'GOOGLE_PAY'], required: true },
      status: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
      stripeSessionId: { type: String },
      transactionId: { type: String },
      paidAt: { type: Date },
      cardLast4: { type: String },
      cardBrand: { type: String },
    },
    items: [
      {
        itemKey: { type: String, required: true },
        name_en: { type: String, required: true },
        name_ar: { type: String },
        price: { type: Number, required: true },
        qty: { type: Number, required: true, min: 1 },
        selectedAddons: [
          {
            groupKey: { type: String },
            optionKey: { type: String },
            name_en: { type: String },
            name_ar: { type: String },
            price: { type: Number, default: 0 },
          },
        ],
      },
    ],
    totals: {
      subtotal: { type: Number, required: true },
      vat: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    isMember: { type: Boolean, default: false },
    statusTimeline: [
      {
        status: {
          type: String,
          enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'],
          required: true,
        },
        at: { type: Date, default: Date.now },
        by: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    currentStatus: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    assignedDriver: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Indexes for performance and uniqueness
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true }); // Prevent duplicate order numbers

export default mongoose.model<IOrder>('Order', orderSchema);
