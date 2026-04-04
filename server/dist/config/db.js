import mongoose from 'mongoose';
import { env } from './env';
let isConnected = false;
let listenersRegistered = false;
const registerConnectionListeners = () => {
    if (listenersRegistered) {
        return;
    }
    listenersRegistered = true;
    mongoose.connection.on('connected', () => {
        if (!env.IS_PRODUCTION)
            console.log('✅ MongoDB connected');
    });
    mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error.message);
    });
    mongoose.connection.on('disconnected', () => {
        isConnected = false;
        console.warn('⚠️ MongoDB disconnected');
    });
};
export const connectDB = async (retries = 3) => {
    registerConnectionListeners();
    mongoose.set('strictQuery', true);
    const mongoUri = env.MONGO_URI;
    if (isConnected && mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }
    try {
        await mongoose.connect(mongoUri, {
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
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown MongoDB error';
        console.error('❌ MongoDB connection failed:', message);
        if (retries > 0) {
            console.log(`⏳ Retrying MongoDB connection (${retries} attempts left)`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return connectDB(retries - 1);
        }
        throw error;
    }
};
export const disconnectDB = async () => {
    if (!isConnected && mongoose.connection.readyState === 0) {
        return;
    }
    try {
        await mongoose.disconnect();
        isConnected = false;
        console.log('✅ MongoDB disconnected');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown disconnect error';
        console.error('❌ MongoDB disconnect error:', message);
    }
};
