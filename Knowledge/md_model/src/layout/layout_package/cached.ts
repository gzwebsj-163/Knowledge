import { DiffMatrixLayout } from '../index';
import { DiffTypeIndex } from '../layout';
import type { DiffMatrixCell } from '../layout';
import { ShardType } from '../../types/shard.type';

export class CachedDiffMatrixLayout extends DiffMatrixLayout {
  private cache: Map<string, any> = new Map();
  private cacheSize: number;
  private accessOrder: string[] = [];

  constructor(
    shards: ShardType[],
    limits: any[],
    instructions: any[],
    monitors: any[],
    rawStates: any[],
    cacheSize: number = 1000
  ) {
    super(shards, limits, instructions, monitors, rawStates);
    this.cacheSize = cacheSize;
  }

  private getCacheKey(operation: string, params: any[]): string {
    return `${operation}:${JSON.stringify(params)}`;
  }

  private setCache(key: string, value: any): void {
    if (this.cache.size >= this.cacheSize) {
      const oldestKey = this.accessOrder.shift();
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
    this.accessOrder.push(key);
  }

  private getCache(key: string): any {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
      this.accessOrder.push(key);
    }
    return this.cache.get(key);
  }

  public buildMatrixCached(rows: number, cols: number): DiffMatrixCell<unknown>[][] {
    const key = this.getCacheKey('buildMatrix', [rows, cols]);
    let matrix = this.getCache(key);
    if (!matrix) {
      matrix = this.buildMatrix(rows, cols);
      this.setCache(key, matrix);
    }
    return matrix;
  }

  public sortByDiffScoreCached(): DiffMatrixCell<unknown>[] {
    const key = this.getCacheKey('sortByDiffScore', []);
    let sorted = this.getCache(key);
    if (!sorted) {
      sorted = this.sortByDiffScore();
      this.setCache(key, sorted);
    }
    return sorted;
  }

  public getQueueByTypeCached(type: DiffTypeIndex): DiffMatrixCell<unknown>[] {
    const key = this.getCacheKey('getQueueByType', [type]);
    let queue = this.getCache(key);
    if (!queue) {
      queue = this.getQueueByType(type);
      this.setCache(key, queue);
    }
    return queue;
  }

  public clearCache(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  public getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0
    };
  }
}