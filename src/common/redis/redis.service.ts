import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async set(key: string, value: unknown, ttl?: number) {
    const data = JSON.stringify(value);
    if (ttl) {
      await this.redis.set(key, data, 'EX', ttl);
    } else {
      await this.redis.set(key, data);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async del(key: string): Promise<number> {
    return await this.redis.del(key);
  }

  async exists(key: string): Promise<number> {
    return await this.redis.exists(key);
  }
  async ttl(key: string): Promise<number> {
    return await this.redis.ttl(key);
  }

  async hSet(
    key: string,
    fieldOrData: string | Record<string, unknown>,
    value?: unknown,
  ): Promise<number> {
    if (typeof fieldOrData === 'string') {
      await this.redis.hset(key, fieldOrData, JSON.stringify(value));
    }
    const payload = Object.fromEntries(
      Object.entries(fieldOrData).map(([k, v]) => [k, JSON.stringify(v)]),
    );
    return this.redis.hset(key, payload);
  }

  async hGet<T>(key: string, field: string): Promise<T | null> {
    const v = await this.redis.hget(key, field);
    if (!v) return null;
    return JSON.parse(v) as T;
  }

  async hGetAll<T>(key: string): Promise<Record<string, T>> {
    const data = await this.redis.hgetall(key);
    const result: Record<string, T> = {};
    for (const k in data) {
      result[k] = JSON.parse(data[k]) as T;
    }
    return result;
  }

  async hDel(key: string, field: string): Promise<number> {
    return await this.redis.hdel(key, field);
  }

  async hExists(key: string, field: string): Promise<number> {
    return await this.redis.hexists(key, field);
  }
}
