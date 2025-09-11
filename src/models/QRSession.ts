import mongoose, { Schema, Document } from 'mongoose';

export interface IQRSession extends Document {
  token: string;
  date: string;
  expiresAt: Date;
  usedBy: string[]; // student IDs
  isActive: boolean;
}

const QRSessionSchema: Schema = new Schema({
  token: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  usedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
});

export default mongoose.models.QRSession || mongoose.model('QRSession', QRSessionSchema);