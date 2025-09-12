import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

async function connectDB(): Promise<typeof mongoose> {
  // During build time, return a mock connection to avoid actual DB connection
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    // This is a build-time check
    return mongoose;
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    return mongoose;
  } catch (e) {
    console.error('MongoDB connection error:', e);
    throw e;
  }
}

export default connectDB;