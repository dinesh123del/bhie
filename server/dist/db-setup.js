import { env } from './config/env';
export async function startMemoryDB() {
    if (!env.MONGO_URI) {
        throw new Error('MONGO_URI is required');
    }
}
export async function stopMemoryDB() {
    // No-op placeholder kept for compatibility.
}
