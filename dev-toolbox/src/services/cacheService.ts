// 缓存服务 - 用于持久化API数据并控制刷新频率

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // 毫秒
}

class CacheService {
  private storageKey = 'dev-toolbox-cache';

  // 获取缓存
  get<T>(key: string): T | null {
    try {
      const cache = this.getCache();
      const item = cache[key] as CacheItem<T> | undefined;

      if (!item) {
        return null;
      }

      const now = Date.now();
      if (now - item.timestamp > item.expiresIn) {
        // 缓存过期，删除
        this.remove(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }

  // 设置缓存
  set<T>(key: string, data: T, expiresIn: number): void {
    try {
      const cache = this.getCache();
      cache[key] = {
        data,
        timestamp: Date.now(),
        expiresIn,
      };
      this.saveCache(cache);
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  // 删除缓存
  remove(key: string): void {
    try {
      const cache = this.getCache();
      delete cache[key];
      this.saveCache(cache);
    } catch (error) {
      console.error('Error removing cache:', error);
    }
  }

  // 清空所有缓存
  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // 检查缓存是否存在且未过期
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // 获取缓存剩余时间（毫秒）
  getRemainingTime(key: string): number {
    try {
      const cache = this.getCache();
      const item = cache[key];

      if (!item) {
        return 0;
      }

      const now = Date.now();
      const elapsed = now - item.timestamp;
      const remaining = item.expiresIn - elapsed;

      return Math.max(0, remaining);
    } catch (error) {
      return 0;
    }
  }

  private getCache(): Record<string, any> {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      return {};
    }
  }

  private saveCache(cache: Record<string, any>): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(cache));
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }
}

// 导出单例
export const cacheService = new CacheService();

// 预定义的缓存时间
export const CACHE_DURATION = {
  FIVE_MINUTES: 5 * 60 * 1000,      // 5分钟
  ONE_HOUR: 60 * 60 * 1000,         // 1小时
  SIX_HOURS: 6 * 60 * 60 * 1000,    // 6小时
  ONE_DAY: 24 * 60 * 60 * 1000,     // 1天
};

// 缓存键名
export const CACHE_KEYS = {
  WEATHER: (city: string) => `weather_${city}`,
  NEWS: 'news',
  QUOTE: 'quote',
};
