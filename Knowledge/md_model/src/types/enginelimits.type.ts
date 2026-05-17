import { EngineLimits } from "../utils/enginelimits";

export class EngineLimitsType implements EngineLimits {
  maxLoopCount: number;
  maxMemoryMB: number;
  maxCpuPercent: number;
  maxWorkers: number;
  execTimeoutMs: number;
  maxQueueSize: number;

  constructor(
    maxLoopCount: number,
    maxMemoryMB: number,
    maxCpuPercent: number,
    maxWorkers: number,
    execTimeoutMs: number,
    maxQueueSize: number
  ) {
    this.maxLoopCount = maxLoopCount;
    this.maxMemoryMB = maxMemoryMB;
    this.maxCpuPercent = maxCpuPercent;
    this.maxWorkers = maxWorkers;
    this.execTimeoutMs = execTimeoutMs;
    this.maxQueueSize = maxQueueSize;
  }

  getMaxLoopCount(): number {
    return this.maxLoopCount;
  }

  setMaxLoopCount(value: number): void {
    this.maxLoopCount = value > 0 ? value : 1;
  }

  getMaxMemoryMB(): number {
    return this.maxMemoryMB;
  }

  setMaxMemoryMB(value: number): void {
    this.maxMemoryMB = value > 0 ? value : 64;
  }

  getMaxCpuPercent(): number {
    return this.maxCpuPercent;
  }

  setMaxCpuPercent(value: number): void {
    this.maxCpuPercent = Math.max(1, Math.min(100, value));
  }

  getMaxWorkers(): number {
    return this.maxWorkers;
  }

  setMaxWorkers(value: number): void {
    this.maxWorkers = value > 0 ? value : 1;
  }

  getExecTimeoutMs(): number {
    return this.execTimeoutMs;
  }

  setExecTimeoutMs(value: number): void {
    this.execTimeoutMs = value > 0 ? value : 1000;
  }

  getMaxQueueSize(): number {
    return this.maxQueueSize;
  }

  setMaxQueueSize(value: number): void {
    this.maxQueueSize = value > 0 ? value : 32;
  }

  isLoopOverLimit(count: number): boolean {
    return count > this.maxLoopCount;
  }

  isMemoryOverLimit(usedMB: number): boolean {
    return usedMB > this.maxMemoryMB;
  }

  isCpuOverLimit(percent: number): boolean {
    return percent > this.maxCpuPercent;
  }

  isWorkersOverLimit(count: number): boolean {
    return count > this.maxWorkers;
  }

  isTimeoutExceeded(elapsedMs: number): boolean {
    return elapsedMs > this.execTimeoutMs;
  }

  isQueueOverLimit(size: number): boolean {
    return size > this.maxQueueSize;
  }

  toJSON(): EngineLimits {
    return {
      maxLoopCount: this.maxLoopCount,
      maxMemoryMB: this.maxMemoryMB,
      maxCpuPercent: this.maxCpuPercent,
      maxWorkers: this.maxWorkers,
      execTimeoutMs: this.execTimeoutMs,
      maxQueueSize: this.maxQueueSize,
      getMaxLoopCount: function (): number {
        throw new Error("Function not implemented.");
      },
      setMaxLoopCount: function (value: number): void {
        throw new Error("Function not implemented.");
      },
      getMaxMemoryMB: function (): number {
        throw new Error("Function not implemented.");
      },
      setMaxMemoryMB: function (value: number): void {
        throw new Error("Function not implemented.");
      },
      getMaxCpuPercent: function (): number {
        throw new Error("Function not implemented.");
      },
      setMaxCpuPercent: function (value: number): void {
        throw new Error("Function not implemented.");
      },
      getMaxWorkers: function (): number {
        throw new Error("Function not implemented.");
      },
      setMaxWorkers: function (value: number): void {
        throw new Error("Function not implemented.");
      },
      getExecTimeoutMs: function (): number {
        throw new Error("Function not implemented.");
      },
      setExecTimeoutMs: function (value: number): void {
        throw new Error("Function not implemented.");
      },
      getMaxQueueSize: function (): number {
        throw new Error("Function not implemented.");
      },
      setMaxQueueSize: function (value: number): void {
        throw new Error("Function not implemented.");
      },
      isLoopOverLimit: function (count: number): boolean {
        throw new Error("Function not implemented.");
      },
      isMemoryOverLimit: function (usedMB: number): boolean {
        throw new Error("Function not implemented.");
      },
      isCpuOverLimit: function (percent: number): boolean {
        throw new Error("Function not implemented.");
      },
      isWorkersOverLimit: function (count: number): boolean {
        throw new Error("Function not implemented.");
      },
      isTimeoutExceeded: function (elapsedMs: number): boolean {
        throw new Error("Function not implemented.");
      },
      isQueueOverLimit: function (size: number): boolean {
        throw new Error("Function not implemented.");
      },
      toJSON: function (): EngineLimits {
        throw new Error("Function not implemented.");
      },
      clone: function (): EngineLimits {
        throw new Error("Function not implemented.");
      }
    };
  }

  clone(): EngineLimitsType {
    return new EngineLimitsType(
      this.maxLoopCount,
      this.maxMemoryMB,
      this.maxCpuPercent,
      this.maxWorkers,
      this.execTimeoutMs,
      this.maxQueueSize
    );
  }
}