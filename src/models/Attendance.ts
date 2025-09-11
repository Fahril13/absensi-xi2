import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  date: Date;
  status: 'hadir' | 'izin' | 'sakit' | 'alfa';
  timestamp: Date;
}

const AttendanceSchema: Schema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['hadir', 'izin', 'sakit', 'alfa'], required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);