import { createClient } from 'redis';
import config from '../config';
import logger from '../utils/logger';

const redisUrl = config.redisUrl;
const client = createClient({
  url: redisUrl,
});

(async () => {
  try {
    await client.connect();
    logger.info('Redis connected successfully');
  } catch (err) {
    const error = err as Error;
    logger.error('Redis connection error:', error.message);
  }
})();

client.on('error', (err) => {
  logger.error('Redis error:', err.message);
});

const setWithExpiry = async (key: string, value: string, expiryInSeconds: number): Promise<boolean> => {
  try {
    await client.set(key, value, { EX: expiryInSeconds });
    return true;
  } catch (error) {
    logger.error(`Redis setWithExpiry error: ${(error as Error).message}`);
    return false;
  }
};

const get = async (key: string): Promise<string | null> => {
  try {
    return await client.get(key);
  } catch (error) {
    logger.error(`Redis get error: ${(error as Error).message}`);
    return null;
  }
};

const del = async (key: string): Promise<boolean> => {
  try {
    await client.del(key);
    return true;
  } catch (error) {
    logger.error(`Redis del error: ${(error as Error).message}`);
    return false;
  }
};

const blacklistToken = async (token: string, expiryInSeconds: number): Promise<boolean> => {
  return await setWithExpiry(`bl_${token}`, 'true', expiryInSeconds);
};

const getBlacklistedToken = async (token: string): Promise<string | null> => {
  return await get(`bl_${token}`);
};

const cacheCoursesData = async (courses: any): Promise<boolean> => {
  try {
    await client.set('courses', JSON.stringify(courses), { EX: 3600 });
    return true;
  } catch (error) {
    logger.error(`Redis cache courses error: ${(error as Error).message}`);
    return false;
  }
};

const getCachedCoursesData = async (): Promise<any | null> => {
  try {
    const data = await client.get('courses');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Redis get cached courses error: ${(error as Error).message}`);
    return null;
  }
};

const clearCache = async (pattern?: string): Promise<boolean> => {
  try {
    if (pattern) {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
    }
    return true;
  } catch (error) {
    logger.error(`Redis clear cache error: ${(error as Error).message}`);
    return false;
  }
};

export default {
  setWithExpiry,
  get,
  del,
  blacklistToken,
  getBlacklistedToken,
  cacheCoursesData,
  getCachedCoursesData,
  clearCache,
};
