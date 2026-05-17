import { ShardType } from "../types/shard.type";
import { EngineLimitsType } from "../types/enginelimits.type";
import { InstructionType } from "../types/instruction.type";
import { MonitorDataType } from "../types/monitordata.type";
import { RawStateDataType } from "../types/rawstatedata.type";
import { DiffMatrixCell, DiffTypeIndex } from "./layout";

export interface DiffView {
  shardId: number;
  row: number;
  cellData: unknown;
  isModified: boolean;
}

export interface CellDataMap {
  forEach(callback: (row: unknown, rowIndex: number) => void): unknown;
  [DiffTypeIndex.INSTRUCTION]: InstructionType;
  [DiffTypeIndex.SHARD]: ShardType;
  [DiffTypeIndex.ENGINE_LIMITS]: { max: number };
}

export type SpecificShardCell = DiffMatrixCell<ShardType>;

export type DiffQueueMap = Record<DiffTypeIndex, DiffMatrixCell<unknown>[]>;

export class DiffMatrixLayout {
  matrix: DiffMatrixCell<unknown>[][] = [];
  private diffScores: number[] = [];

  constructor(
    private readonly shards: ShardType[],
    private readonly limits: EngineLimitsType[],
    private readonly instructions: InstructionType[],
    private readonly monitors: MonitorDataType[],
    private readonly rawStates: RawStateDataType[]
  ) {}

  public calculateDiffScore(cell: DiffMatrixCell<unknown>): number {
    const baseScore = cell.typeIndex * 1000;
    const dataHash = JSON.stringify(cell.data).length;
    const positionScore = cell.position[0] * 10 + cell.position[1];
    return baseScore + (dataHash % 500) + positionScore;
  }

  public buildMatrix(rows: number, cols: number): DiffMatrixCell<unknown>[][] {
    this.matrix = Array.from({ length: rows }, () => Array(cols).fill(null));
    const allItems = this.flattenAllData();
    let index = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (index >= allItems.length) break;

        const item = allItems[index++];
        const cell: DiffMatrixCell<unknown> = {
          typeIndex: item.typeIndex,
          data: item.data,
          diffScore: 0,
          position: [r, c],
        };
        cell.diffScore = this.calculateDiffScore(cell);
        this.diffScores.push(cell.diffScore);
        this.matrix[r][c] = cell;
      }
    }

    return this.matrix;
  }
  public sortByDiffScore(): DiffMatrixCell<unknown>[] {
    return this.flattenMatrix().sort((a, b) => a.diffScore - b.diffScore);
  }

  public flattenMatrix(): DiffMatrixCell<unknown>[] {
    return this.matrix.flat().filter(Boolean);
  }

  public flattenAllData(): Array<{
    typeIndex: DiffTypeIndex;
    data: unknown;
  }> {
    const result: Array<{ typeIndex: DiffTypeIndex; data: unknown }> = [];
    this.shards.forEach((s) => result.push({ typeIndex: DiffTypeIndex.SHARD, data: s }));
    this.limits.forEach((l) => result.push({ typeIndex: DiffTypeIndex.ENGINE_LIMITS, data: l }));
    this.instructions.forEach((i) => result.push({ typeIndex: DiffTypeIndex.INSTRUCTION, data: i }));
    this.monitors.forEach((m) => result.push({ typeIndex: DiffTypeIndex.MONITOR_DATA, data: m }));
    this.rawStates.forEach((r) => result.push({ typeIndex: DiffTypeIndex.RAW_STATE_DATA, data: r }));

    return result;
  }

  public createDiffView(matrix: CellDataMap, shardId: number): DiffView[] {
    const view: DiffView[] = [];
    matrix.forEach((row: unknown[], rowIndex: number) => {
      row.forEach((cell: { status: string }) => {
        view.push({
          shardId,
          row: rowIndex,
          cellData: cell,
          isModified: cell.status === "CHANGED",
        });
      });
    });

    return view;
  }

  public getMatrixLayoutView(): string {
    let view = "";
    for (const row of this.matrix) {
      const line = row.map((c) => c?.typeIndex ?? ".").join(" ");
      view += line + "\n";
    }
    return view;
  }
  public splitQueuesByType(): DiffQueueMap {
    const all = this.flattenMatrix();
    const queues = {} as DiffQueueMap;
    (Object.values(DiffTypeIndex) as DiffTypeIndex[]).forEach((type) => {
      queues[type] = [];
    });
    all.forEach((cell) => {
      queues[cell.typeIndex].push(cell);
    });
    return queues;
  }

  public getQueueByType(type: DiffTypeIndex): DiffMatrixCell<unknown>[] {
    return this.splitQueuesByType()[type];
  }
  public splitByModified(views: DiffView[]): { modified: DiffView[]; unchanged: DiffView[] } {
    const modified = views.filter(v => v.isModified);
    const unchanged = views.filter(v => !v.isModified);
    return { modified, unchanged };
  }
  public splitByScoreRange(): {
    low: DiffMatrixCell<unknown>[];
    medium: DiffMatrixCell<unknown>[];
    high: DiffMatrixCell<unknown>[];
  } {
    const all = this.sortByDiffScore();
    const size = all.length;
    return {
      low: all.slice(0, size * 0.33),
      medium: all.slice(size * 0.33, size * 0.66),
      high: all.slice(size * 0.66),
    };
  }

  public getQueueStats(): Record<string, number> {
    const queues = this.splitQueuesByType();
    return {
      shard: queues[DiffTypeIndex.SHARD]?.length || 0,
      engineLimits: queues[DiffTypeIndex.ENGINE_LIMITS]?.length || 0,
      instruction: queues[DiffTypeIndex.INSTRUCTION]?.length || 0,
      monitorData: queues[DiffTypeIndex.MONITOR_DATA]?.length || 0,
      rawStateData: queues[DiffTypeIndex.RAW_STATE_DATA]?.length || 0,
      total: this.flattenMatrix().length,
    };
  }
}
