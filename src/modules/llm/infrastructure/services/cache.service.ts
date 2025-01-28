import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class LLMCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  private generateCacheKey(prompt: string, model: string): string {
    return `llm:${model}:${Buffer.from(prompt).toString('base64')}`;
  }

  async getCachedResponse(prompt: string, model: string): Promise<string | null> {
    const key = this.generateCacheKey(prompt, model);
    return await this.cacheManager.get<string>(key);
  }

  async cacheResponse(prompt: string, model: string, response: string): Promise<void> {
    const key = this.generateCacheKey(prompt, model);
    const ttl = this.configService.get<number>('llm.cacheTTL', 3600); // Default 1 hour
    await this.cacheManager.set(key, response, ttl);
  }

  async invalidateCache(prompt: string, model: string): Promise<void> {
    const key = this.generateCacheKey(prompt, model);
    await this.cacheManager.del(key);
  }
}
