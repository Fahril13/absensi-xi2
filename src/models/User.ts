import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'guru' | 'siswa';
  class: string; // 'XI-2'
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['guru', 'siswa'], required: true },
  class: { type: String, default: 'XI-2' },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);