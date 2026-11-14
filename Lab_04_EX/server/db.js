import mongoose from 'mongoose';

mongoose.connection.on('error', (err) => console.error('Mongo error:', err.message));

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
