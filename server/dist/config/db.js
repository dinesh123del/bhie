import mongoose from 'mongoose';
import { env } from './env.js';
let isConnected = false;
let listenersRegistered = false;
const registerConnectionListeners = () => {
    if (listenersRegistered) {
        return;
    }
    listenersRegistered = true;
    mongoose.connection.on('connected', () => {
        console.log('✅ MongoDB connected successfully');
    });
    mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error.message);
    });
    mongoose.connection.on('disconnected', () => {
        isConnected = false;
        console.warn('⚠️ MongoDB disconnected');
    });
};
/**
 * Converts mongodb+srv:// to direct mongodb:// connection string
 * using the resolved shard nodes. This bypasses Node.js SRV lookup
 * failures that occur on some networks/DNS configurations.
 */
function buildDirectUri(user, pass, dbName) {
    const shards = [
        'ac-imxdfzd-shard-00-00.2vi2cbd.mongodb.net:27017',
        'ac-imxdfzd-shard-00-01.2vi2cbd.mongodb.net:27017',
        'ac-imxdfzd-shard-00-02.2vi2cbd.mongodb.net:27017',
    ];
    return `mongodb://${user}:${pass}@${shards.join(',')}/${dbName}?ssl=true&replicaSet=atlas-txsl1d-shard-0&authSource=admin&retryWrites=true&w=majority`;
}
export const connectDB = async (retries = 3) => {
    registerConnectionListeners();
    mongoose.set('strictQuery', true);
    if (isConnected && mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }
    // Primary: use environment URI
    let mongoUri = env.MONGO_URI || env.MONGODB_URI;
    // If using +srv protocol, try it first but fall back to direct connection
    const useSrv = mongoUri && mongoUri.startsWith('mongodb+srv://');
    if (useSrv) {
        try {
            console.log('🔌 Attempting MongoDB connection via SRV...');
            await mongoose.connect(mongoUri, {
                serverSelectionTimeoutMS: 8000,
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
        catch (srvError) {
            const msg = srvError instanceof Error ? srvError.message : String(srvError);
            console.warn(`⚠️ SRV connection failed (${msg}). Falling back to direct connection...`);
            // Extract credentials from the SRV URI and build direct connection
            try {
                const url = new URL(mongoUri);
                const user = decodeURIComponent(url.username);
                const pass = decodeURIComponent(url.password);
                const dbName = url.pathname.replace('/', '') || 'biz-plus';
                mongoUri = buildDirectUri(user, pass, dbName);
            }
            catch {
                console.error('❌ Could not parse SRV URI for fallback. Using hardcoded direct URI.');
                mongoUri = buildDirectUri('dineshbolla9_db_user', 'FA0Y3IeGHRrfMi6C', 'biz-plus');
            }
        }
    }
    // Direct connection (non-SRV or fallback)
    return connectWithRetry(mongoUri, retries);
};
async function connectWithRetry(uri, retries) {
    try {
        console.log(`🔌 Connecting to MongoDB (direct)... [${retries} retries left]`);
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
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown MongoDB error';
        console.error('❌ MongoDB connection failed:', message);
        if (retries > 0) {
            console.log(`⏳ Retrying MongoDB connection (${retries - 1} attempts left)`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return connectWithRetry(uri, retries - 1);
        }
        throw error;
    }
}
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
