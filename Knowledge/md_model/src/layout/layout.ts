export enum DiffTypeIndex {
  SHARD = 0,
  ENGINE_LIMITS = 1,
  INSTRUCTION = 2,
  MONITOR_DATA = 3,
  RAW_STATE_DATA = 4,
}
export interface DiffMatrixCell<T> {
  typeIndex: DiffTypeIndex;
  data: T;
  diffScore: number;
  position: [row: number, col: number];
}

export interface DiffMatrix<TData = any> {
  matrix: TData[][];
  diffScores: number[];
}