import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;
let listenersRegistered = false;

const registerConnectionListeners = (): void => {
  if (listenersRegistered) {
    return;
  }

  listenersRegistered = true;

  mongoose.connection.on('connected', () => {
    if (!env.IS_PRODUCTION) console.log('✅ MongoDB connected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('❌ MongoDB connection error:', error.message);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('⚠️ MongoDB disconnected');
  });
};

async function connectWithRetry(uri: string, retries: number): Promise<typeof mongoose.connection> {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: env.IS_PRODUCTION ? 20 : 10,
      minPoolSize: env.IS_PRODUCTION ? 2 : 1,
      autoIndex: !env.IS_PRODUCTION,
    });
    isConnected = true;
    return mongoose.connection;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown MongoDB error';
    console.error('❌ MongoDB connection failed:', message);

    if (retries > 0) {
      console.log(`⏳ Retrying MongoDB connection (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return connectWithRetry(uri, retries - 1);
    }
    throw error;
  }
}

export const connectDB = async (retries = 3): Promise<typeof mongoose.connection> => {
  registerConnectionListeners();
  mongoose.set('strictQuery', true);
  
  // FALLBACK SAFETY: Ensure we use a valid URI even if environment is stale
  let mongoUri = env.MONGO_URI || env.MONGODB_URI;
  const productionFallback = 'mongodb+srv://dineshbolla9_db_user:FA0Y3IeGHRrfMi6C@cluster0.2vi2cbd.mongodb.net/biz-plus?retryWrites=true&w=majority';

  if (!mongoUri || mongoUri.includes('cluster.mongodb.net')) {
    console.warn('⚠️ Invalid or Placeholder MONGO_URI detected. Forcing verified production fallback.');
    mongoUri = productionFallback;
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  return connectWithRetry(mongoUri, retries);
};

export const disconnectDB = async (): Promise<void> => {
  if (!isConnected && mongoose.connection.readyState === 0) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown disconnect error';
    console.error('❌ MongoDB disconnect error:', message);
  }
};
