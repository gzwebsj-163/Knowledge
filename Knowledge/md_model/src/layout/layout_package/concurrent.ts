import { DiffMatrixLayout } from '../index';
import { DiffTypeIndex } from '../layout';
import type { DiffMatrixCell } from '../layout';
import { ShardType } from '../../types/shard.type';

export class ConcurrentDiffMatrixLayout extends DiffMatrixLayout {
  private workerPool: Worker[] = [];
  private maxWorkers: number;

  constructor(
    shards: ShardType[],
    limits: any[],
    instructions: any[],
    monitors: any[],
    rawStates: any[],
    maxWorkers: number = 4
  ) {
    super(shards, limits, instructions, monitors, rawStates);
    this.maxWorkers = maxWorkers;
    this.initializeWorkers();
  }

  private initializeWorkers(): void {
    for (let i = 0; i < this.maxWorkers; i++) {
      this.workerPool.push({} as Worker);
    }
  }

  public async buildMatrixConcurrent(rows: number, cols: number): Promise<DiffMatrixCell<unknown>[][]> {
    const chunks = this.splitWorkload(rows * cols, this.maxWorkers);
    const promises = chunks.map((chunk, index) =>
      this.processChunkAsync(chunk.start, chunk.end, rows, cols)
    );

    const results = await Promise.all(promises);
    return this.mergeResults(results, rows, cols);
  }

  private splitWorkload(totalItems: number, numWorkers: number): Array<{ start: number; end: number }> {
    const chunkSize = Math.ceil(totalItems / numWorkers);
    const chunks = [];
    for (let i = 0; i < numWorkers; i++) {
      const start = i * chunkSize;
      const end = Math.min((i + 1) * chunkSize, totalItems);
      chunks.push({ start, end });
    }
    return chunks;
  }

  private async processChunkAsync(start: number, end: number, rows: number, cols: number): Promise<DiffMatrixCell<unknown>[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cells: DiffMatrixCell<unknown>[] = [];
        const allItems = this.flattenAllData();
        for (let i = start; i < end && i < allItems.length; i++) {
          const item = allItems[i];
          const r = Math.floor(i / cols);
          const c = i % cols;
          const cell: DiffMatrixCell<unknown> = {
            typeIndex: item.typeIndex,
            data: item.data,
            diffScore: 0,
            position: [r, c],
          };
          cell.diffScore = this.calculateDiffScore(cell);
          cells.push(cell);
        }
        resolve(cells);
      }, Math.random() * 100);
    });
  }

  private mergeResults(results: DiffMatrixCell<unknown>[][], rows: number, cols: number): DiffMatrixCell<unknown>[][] {
    const matrix: DiffMatrixCell<unknown>[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
    let index = 0;
    for (const chunk of results) {
      for (const cell of chunk) {
        const [r, c] = cell.position;
        if (r < rows && c < cols) {
          matrix[r][c] = cell;
        }
      }
    }

    return matrix;
  }

  public async sortByDiffScoreConcurrent(): Promise<DiffMatrixCell<unknown>[]> {
    const cells = this.flattenMatrix();
    const chunks = this.splitWorkload(cells.length, this.maxWorkers);

    const promises = chunks.map(chunk =>
      this.sortChunkAsync(cells.slice(chunk.start, chunk.end))
    );

    const sortedChunks = await Promise.all(promises);
    return this.mergeSort(sortedChunks);
  }

  private async sortChunkAsync(chunk: DiffMatrixCell<unknown>[]): Promise<DiffMatrixCell<unknown>[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(chunk.sort((a, b) => a.diffScore - b.diffScore));
      }, Math.random() * 50);
    });
  }

  private mergeSort(sortedChunks: DiffMatrixCell<unknown>[][]): DiffMatrixCell<unknown>[] {
    const result: DiffMatrixCell<unknown>[] = [];
    const indices = new Array(sortedChunks.length).fill(0);
    while (true) {
      let minIndex = -1;
      let minValue = Infinity;
      for (let i = 0; i < sortedChunks.length; i++) {
        if (indices[i] < sortedChunks[i].length) {
          const cell = sortedChunks[i][indices[i]];
          if (cell.diffScore < minValue) {
            minValue = cell.diffScore;
            minIndex = i;
          }
        }
      }
      if (minIndex === -1) break;
      result.push(sortedChunks[minIndex][indices[minIndex]]);
      indices[minIndex]++;
    }
    return result;
  }

  public calculateDiffScore(cell: DiffMatrixCell<unknown>): number {
    const baseScore = cell.typeIndex * 1000;
    const dataHash = JSON.stringify(cell.data).length;
    const positionScore = cell.position[0] * 10 + cell.position[1];
    return baseScore + (dataHash % 500) + positionScore;
  }

  public flattenAllData(): Array<{ typeIndex: DiffTypeIndex; data: unknown }> {
    const result: Array<{ typeIndex: DiffTypeIndex; data: unknown }> = [];
    return result;
  }
}