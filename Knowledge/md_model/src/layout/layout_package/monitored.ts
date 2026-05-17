import { DiffMatrixLayout } from '../index';
import type { DiffMatrixCell } from '../layout';
import { ShardType } from '../../types/shard.type';
export class MonitoredDiffMatrixLayout extends DiffMatrixLayout {
  private metrics: {
    operationCount: number;
    errorCount: number;
    avgResponseTime: number;
    lastHealthCheck: number;
    alerts: Alert[];
  } = {
    operationCount: 0,
    errorCount: 0,
    avgResponseTime: 0,
    lastHealthCheck: Date.now(),
    alerts: []
  };

  private thresholds: {
    maxResponseTime: number;
    maxErrorRate: number;
    healthCheckInterval: number;
  };

  private alertCallbacks: Array<(alert: Alert) => void> = [];

  constructor(
    shards: ShardType[],
    limits: any[],
    instructions: any[],
    monitors: any[],
    rawStates: any[],
    thresholds: {
      maxResponseTime?: number;
      maxErrorRate?: number;
      healthCheckInterval?: number;
    } = {}
  ) {
    super(shards, limits, instructions, monitors, rawStates);
    this.thresholds = {
      maxResponseTime: thresholds.maxResponseTime || 1000,
      maxErrorRate: thresholds.maxErrorRate || 0.05,
      healthCheckInterval: thresholds.healthCheckInterval || 60000
    };
    this.startHealthMonitoring();
  }

  private startHealthMonitoring(): void {
    setInterval(() => {
      this.performHealthCheck();
    }, this.thresholds.healthCheckInterval);
  }

  private performHealthCheck(): void {
    const now = Date.now();
    const timeSinceLastCheck = now - this.metrics.lastHealthCheck;
    if (this.metrics.avgResponseTime > this.thresholds.maxResponseTime) {
      this.raiseAlert({
        type: 'PERFORMANCE',
        severity: 'WARNING',
        message: `Average response time ${this.metrics.avgResponseTime}ms exceeds threshold ${this.thresholds.maxResponseTime}ms`,
        timestamp: now
      });
    }
    const errorRate = this.metrics.operationCount > 0 ? this.metrics.errorCount / this.metrics.operationCount : 0;
    if (errorRate > this.thresholds.maxErrorRate) {
      this.raiseAlert({
        type: 'ERROR_RATE',
        severity: 'ERROR',
        message: `Error rate ${errorRate.toFixed(2)} exceeds threshold ${this.thresholds.maxErrorRate}`,
        timestamp: now
      });
    }
    const matrix = this.getMatrixData();
    if (!matrix || matrix.length === 0) {
      this.raiseAlert({
        type: 'HEALTH',
        severity: 'CRITICAL',
        message: 'Matrix is empty or corrupted',
        timestamp: now
      });
    }

    this.metrics.lastHealthCheck = now;
  }

  private raiseAlert(alert: Alert): void {
    this.metrics.alerts.push(alert);
    if (this.metrics.alerts.length > 100) {
      this.metrics.alerts.shift();
    }
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Alert callback failed:', error);
      }
    });
  }

  public onAlert(callback: (alert: Alert) => void): void {
    this.alertCallbacks.push(callback);
  }

  public removeAlertCallback(callback: (alert: Alert) => void): void {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
    }
  }
  public buildMatrix(rows: number, cols: number): DiffMatrixCell<unknown>[][] {
    const startTime = Date.now();
    try {
      this.metrics.operationCount++;
      const result = super.buildMatrix(rows, cols);
      this.updateResponseTime(Date.now() - startTime);
      return result;
    } catch (error) {
      this.metrics.errorCount++;
      this.raiseAlert({
        type: 'OPERATION_ERROR',
        severity: 'ERROR',
        message: `buildMatrix failed: ${error.message}`,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  public sortByDiffScore(): DiffMatrixCell<unknown>[] {
    const startTime = Date.now();
    try {
      this.metrics.operationCount++;
      const result = super.sortByDiffScore();
      this.updateResponseTime(Date.now() - startTime);
      return result;
    } catch (error) {
      this.metrics.errorCount++;
      this.raiseAlert({
        type: 'OPERATION_ERROR',
        severity: 'ERROR',
        message: `sortByDiffScore failed: ${error.message}`,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  private updateResponseTime(duration: number): void {
    const alpha = 0.1;
    this.metrics.avgResponseTime = alpha * duration + (1 - alpha) * this.metrics.avgResponseTime;
  }

  private getMatrixData(): DiffMatrixCell<unknown>[][] {
    return (this as any).matrix || [];
  }

  public getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }

  public getActiveAlerts(): Alert[] {
    const now = Date.now();
    const recentAlerts = this.metrics.alerts.filter(alert =>
      now - alert.timestamp < 24 * 60 * 60 * 1000
    );
    return recentAlerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  public clearAlerts(): void {
    this.metrics.alerts = [];
  }

  public getHealthStatus(): HealthStatus {
    const errorRate = this.metrics.operationCount > 0 ? this.metrics.errorCount / this.metrics.operationCount : 0;
    const isHealthy = this.metrics.avgResponseTime <= this.thresholds.maxResponseTime &&
                      errorRate <= this.thresholds.maxErrorRate;

    return {
      status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
      uptime: Date.now() - this.metrics.lastHealthCheck,
      metrics: this.getMetrics(),
      lastCheck: new Date(this.metrics.lastHealthCheck).toISOString()
    };
  }
}

export interface Alert {
  type: 'PERFORMANCE' | 'ERROR_RATE' | 'HEALTH' | 'OPERATION_ERROR';
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  timestamp: number;
}

export interface HealthStatus {
  status: 'HEALTHY' | 'UNHEALTHY';
  uptime: number;
  metrics: any;
  lastCheck: string;
}