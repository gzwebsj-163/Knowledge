import { DiffMatrixLayout } from '../index';
import { DiffTypeIndex } from '../layout';
import type { DiffMatrixCell, } from '../layout';
import { ShardType } from '../../types/shard.type';

export class AdvancedDiffMatrixLayout extends DiffMatrixLayout {
  private performanceMetrics: { [key: string]: number } = {};

  constructor(
    shards: ShardType[],
    limits: any[],
    instructions: any[],
    monitors: any[],
    rawStates: any[]
  ) {
    super(shards, limits, instructions, monitors, rawStates);
  }

  private recordPerformance(operation: string, startTime: number): void {
    const duration = Date.now() - startTime;
    this.performanceMetrics[operation] = (this.performanceMetrics[operation] || 0) + duration;
  }

  public getPerformanceStats(): { [key: string]: number } {
    return { ...this.performanceMetrics };
  }

  public sortByMultipleCriteria(
    criteria: Array<'score' | 'type' | 'position'>,
    orders: Array<'asc' | 'desc'> = ['asc']
  ): DiffMatrixCell<unknown>[] {
    const startTime = Date.now();
    let cells = this.flattenMatrix();

    criteria.forEach((criterion, index) => {
      const order = orders[index] || 'asc';
      cells.sort((a, b) => {
        let comparison = 0;

        switch (criterion) {
          case 'score':
            comparison = a.diffScore - b.diffScore;
            break;
          case 'type':
            comparison = a.typeIndex - b.typeIndex;
            break;
          case 'position':
            const posA = a.position[0] * 1000 + a.position[1];
            const posB = b.position[0] * 1000 + b.position[1];
            comparison = posA - posB;
            break;
        }

        return order === 'desc' ? -comparison : comparison;
      });
    });

    this.recordPerformance('sortByMultipleCriteria', startTime);
    return cells;
  }

  public filterByThreshold(
    type: DiffTypeIndex,
    scoreThreshold: number,
    operator: 'gt' | 'lt' | 'eq' = 'gt'
  ): DiffMatrixCell<unknown>[] {
    const startTime = Date.now();
    const cells = this.getQueueByType(type);

    const filtered = cells.filter(cell => {
      switch (operator) {
        case 'gt': return cell.diffScore > scoreThreshold;
        case 'lt': return cell.diffScore < scoreThreshold;
        case 'eq': return cell.diffScore === scoreThreshold;
      }
    });

    this.recordPerformance('filterByThreshold', startTime);
    return filtered;
  }

  public exportToJSON(): string {
    const startTime = Date.now();
    const data = {
      matrix: this.getMatrix(),
      stats: this.getQueueStats(),
      performance: this.getPerformanceStats(),
      timestamp: new Date().toISOString()
    };

    this.recordPerformance('exportToJSON', startTime);
    return JSON.stringify(data, null, 2);
  }

  public exportToCSV(): string {
    const startTime = Date.now();
    const matrix = this.getMatrix();
    let csv = 'Row,Col,TypeIndex,DiffScore,Data\n';

    matrix.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) {
          const dataStr = JSON.stringify(cell.data).replace(/"/g, '""');
          csv += `${rowIndex},${colIndex},${cell.typeIndex},${cell.diffScore},"${dataStr}"\n`;
        }
      });
    });

    this.recordPerformance('exportToCSV', startTime);
    return csv;
  }

  private getMatrix(): DiffMatrixCell<unknown>[][] {
    return (this as any).matrix || [];
  }
}

