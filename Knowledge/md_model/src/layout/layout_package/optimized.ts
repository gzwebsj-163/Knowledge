import { DiffMatrixLayout } from '../index';
import { DiffTypeIndex } from '../layout';
import type { DiffMatrixCell } from '../layout';
import { ShardType } from '../../types/shard.type';
export class OptimizedDiffMatrixLayout extends DiffMatrixLayout {
  private cellMap: Map<string, DiffMatrixCell<unknown>> = new Map();
  private typeIndex: Map<DiffTypeIndex, Set<DiffMatrixCell<unknown>>> = new Map();
  private positionIndex: Map<string, DiffMatrixCell<unknown>> = new Map();
  private scoreIndex: Map<number, DiffMatrixCell<unknown>> = new Map();
  constructor(
    shards: ShardType[],
    limits: any[],
    instructions: any[],
    monitors: any[],
    rawStates: any[]
  ) {
    super(shards, limits, instructions, monitors, rawStates);
    this.initializeIndices();
  }
  private initializeIndices(): void {
    Object.values(DiffTypeIndex).forEach(type => {
      if (typeof type === 'number') {
        this.typeIndex.set(type, new Set());
      }
    });
  }

  private getPositionKey(position: [number, number]): string {
    return `${position[0]},${position[1]}`;
  }
  public buildMatrix(rows: number, cols: number): DiffMatrixCell<unknown>[][] {
    this.clearIndices();
    const matrix = super.buildMatrix(rows, cols);
    matrix.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) {
          const posKey = this.getPositionKey([rowIndex, colIndex]);
          this.cellMap.set(posKey, cell);
          this.positionIndex.set(posKey, cell);
          this.scoreIndex.set(cell.diffScore, cell);
          if (this.typeIndex.has(cell.typeIndex)) {
            this.typeIndex.get(cell.typeIndex)!.add(cell);
          }
        }
      });
    });

    return matrix;
  }

  private clearIndices(): void {
    this.cellMap.clear();
    this.positionIndex.clear();
    this.scoreIndex.clear();
    this.typeIndex.forEach(set => set.clear());
  }

  public getCellAt(position: [number, number]): DiffMatrixCell<unknown> | null {
    return this.positionIndex.get(this.getPositionKey(position)) || null;
  }

  public getCellsByType(type: DiffTypeIndex): DiffMatrixCell<unknown>[] {
    return Array.from(this.typeIndex.get(type) || []);
  }

  public getCellsByScoreRange(minScore: number, maxScore: number): DiffMatrixCell<unknown>[] {
    const result: DiffMatrixCell<unknown>[] = [];
    for (const [score, cell] of this.scoreIndex) {
      if (score >= minScore && score <= maxScore) {
        result.push(cell);
      }
    }
    return result;
  }

  public sortByDiffScoreOptimized(): DiffMatrixCell<unknown>[] {
    return Array.from(this.scoreIndex.values()).sort((a, b) => a.diffScore - b.diffScore);
  }

  public toSparseMatrix(): Map<string, DiffMatrixCell<unknown>> {
    return new Map(this.cellMap);
  }

  public fromSparseMatrix(sparseMatrix: Map<string, DiffMatrixCell<unknown>>): DiffMatrixCell<unknown>[][] {
    let maxRow = 0;
    let maxCol = 0;
    for (const key of sparseMatrix.keys()) {
      const [row, col] = key.split(',').map(Number);
      maxRow = Math.max(maxRow, row);
      maxCol = Math.max(maxCol, col);
    }

    const matrix: DiffMatrixCell<unknown>[][] = Array.from({ length: maxRow + 1 }, () => Array(maxCol + 1).fill(null));
    for (const [key, cell] of sparseMatrix) {
      const [row, col] = key.split(',').map(Number);
      matrix[row][col] = cell;
    }
    return matrix;
  }

  public compress(): CompressedMatrix {
    const cells = Array.from(this.cellMap.values());
    const positions = cells.map(cell => cell.position);
    const data = cells.map(cell => ({
      typeIndex: cell.typeIndex,
      data: cell.data,
      diffScore: cell.diffScore,
      featureCode: (cell as any).featureCode,
      driftCode: (cell as any).driftCode,
      shardId: (cell as any).shardId,
      locked: (cell as any).locked
    }));
    return {
      positions,
      data,
      dimensions: this.getDimensions()
    };
  }

  public decompress(compressed: CompressedMatrix): DiffMatrixCell<unknown>[][] {
    const matrix: DiffMatrixCell<unknown>[][] = Array.from({ length: compressed.dimensions.rows }, () =>
      Array(compressed.dimensions.cols).fill(null)
    );
    compressed.positions.forEach((pos, index) => {
      const cellData = compressed.data[index];
      matrix[pos[0]][pos[1]] = {
        ...cellData,
        position: pos
      };
    });

    return matrix;
  }

  private getDimensions(): { rows: number; cols: number } {
    let maxRow = 0;
    let maxCol = 0;

    for (const key of this.cellMap.keys()) {
      const [row, col] = key.split(',').map(Number);
      maxRow = Math.max(maxRow, row);
      maxCol = Math.max(maxCol, col);
    }

    return { rows: maxRow + 1, cols: maxCol + 1 };
  }
  public queryRange(
    startPos: [number, number],
    endPos: [number, number],
    filter?: (cell: DiffMatrixCell<unknown>) => boolean
  ): DiffMatrixCell<unknown>[] {
    const result: DiffMatrixCell<unknown>[] = [];

    for (let row = startPos[0]; row <= endPos[0]; row++) {
      for (let col = startPos[1]; col <= endPos[1]; col++) {
        const cell = this.getCellAt([row, col]);
        if (cell && (!filter || filter(cell))) {
          result.push(cell);
        }
      }
    }
    return result;
  }
  public getOptimizedStats(): {
    totalCells: number;
    cellsByType: Record<DiffTypeIndex, number>;
    avgScore: number;
    memoryUsage: number;
  } {
    const cells = Array.from(this.cellMap.values());
    const totalCells = cells.length;
    const cellsByType: Record<DiffTypeIndex, number> = {} as any;
    this.typeIndex.forEach((set, type) => {
      cellsByType[type] = set.size;
    });
    const totalScore = cells.reduce((sum, cell) => sum + cell.diffScore, 0);
    const avgScore = totalCells > 0 ? totalScore / totalCells : 0;
    const memoryUsage = this.estimateMemoryUsage();
    return {
      totalCells,
      cellsByType,
      avgScore,
      memoryUsage
    };
  }

  private estimateMemoryUsage(): number {
    return this.cellMap.size * 200;
  }
}

export interface CompressedMatrix {
  positions: [number, number][];
  data: Array<{
    typeIndex: DiffTypeIndex;
    data: any;
    diffScore: number;
    featureCode: string;
    driftCode: string;
    shardId: string;
    locked: boolean;
  }>;
  dimensions: { rows: number; cols: number };
}