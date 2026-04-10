import { redisClient, isRedisConnected } from '../config/redisClient.js';
export class CacheService {
    static async get(key) {
        if (!isRedisConnected())
            return null;
        try {
            const cached = await redisClient.get(key);
            if (!cached)
                return null;
            return JSON.parse(cached.toString());
        }
        catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }
    static async set(key, data, ttl = this.TTL) {
        if (!isRedisConnected())
            return;
        try {
            await redisClient.set(key, JSON.stringify(data), { EX: ttl });
        }
        catch (error) {
            console.error('Cache set error:', error);
        }
    }
    static async del(key) {
        if (!isRedisConnected())
            return;
        try {
            await redisClient.del(key);
        }
        catch (error) {
            console.error('Cache del error:', error);
        }
    }
    static async invalidateUserCache(userId) {
        if (!isRedisConnected())
            return;
        try {
            // Invalidate specific keys we know about
            const keys = [
                `cache:dashboard:${userId}`,
                `cache:analytics:summary:${userId}`,
                `cache:analytics:trends:${userId}`,
                `cache:analytics:score:${userId}`,
                `cache:analytics:predictions:${userId}`,
                `cache:ai:insights:${userId}`
            ];
            await Promise.all(keys.map(key => redisClient.del(key)));
            // Also try to find by pattern if possible (risky if many keys, but safe for small scale)
            const pattern = `cache:*:${userId}`;
            const foundKeys = await redisClient.keys(pattern);
            if (foundKeys.length > 0) {
                await Promise.all(foundKeys.map(key => redisClient.del(key)));
            }
        }
        catch (error) {
            console.error('Cache invalidation error:', error);
        }
    }
    static generateKey(path, userId) {
        // Standardize path keys
        const cleanPath = path.replace(/^\/api\//, '').replace(/\//g, ':').replace(/:$/, '');
        return `cache:${cleanPath || 'root'}:${userId}`;
    }
}
CacheService.TTL = 300; // 5 minutes default
