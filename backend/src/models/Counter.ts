import mongoose, { Document, Schema } from 'mongoose';

export interface ICounter extends Document {
  _id: string; // e.g., "order-15122025"
  seq: number;
  date: string; // DDMMYYYY format
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true }, // Custom ID format
  seq: { type: Number, default: 0 },
  date: { type: String, required: true },
});

export default mongoose.model<ICounter>('Counter', counterSchema);
