import { MonitorData } from "../utils/monitordata";

export class MonitorDataType implements MonitorData {
  cpu: { usage?: number };
  memory: { usedMB?: number; limitMB?: number };

  constructor() {
    this.cpu = {};
    this.memory = {};
  }

  setCpuUsage(usage: number): void {
    this.cpu.usage = Math.max(0, Math.min(100, usage));
  }

  getCpuUsage(): number | undefined {
    return this.cpu.usage;
  }

  clearCpu(): void {
    this.cpu.usage = undefined;
  }

  setMemoryUsed(usedMB: number): void {
    this.memory.usedMB = Math.max(0, usedMB);
  }

  getMemoryUsed(): number | undefined {
    return this.memory.usedMB;
  }

  setMemoryLimit(limitMB: number): void {
    this.memory.limitMB = Math.max(0, limitMB);
  }

  getMemoryLimit(): number | undefined {
    return this.memory.limitMB;
  }

  clearMemory(): void {
    this.memory.usedMB = undefined;
    this.memory.limitMB = undefined;
  }

  isCpuHigh(threshold = 80): boolean {
    return this.cpu.usage !== undefined && this.cpu.usage >= threshold;
  }

  isMemoryOverLimit(): boolean {
    if (this.memory.usedMB === undefined || this.memory.limitMB === undefined) return false;
    return this.memory.usedMB > this.memory.limitMB;
  }

  reset(): void {
    this.clearCpu();
    this.clearMemory();
  }

  toJSON(): MonitorData {
    return {
      cpu: { ...this.cpu },
      memory: { ...this.memory },
      setCpuUsage: function (usage: number): void {
        throw new Error("Function not implemented.");
      },
      getCpuUsage: function (): number | undefined {
        throw new Error("Function not implemented.");
      },
      clearCpu: function (): void {
        throw new Error("Function not implemented.");
      },
      setMemoryUsed: function (usedMB: number): void {
        throw new Error("Function not implemented.");
      },
      getMemoryUsed: function (): number | undefined {
        throw new Error("Function not implemented.");
      },
      setMemoryLimit: function (limitMB: number): void {
        throw new Error("Function not implemented.");
      },
      getMemoryLimit: function (): number | undefined {
        throw new Error("Function not implemented.");
      },
      clearMemory: function (): void {
        throw new Error("Function not implemented.");
      },
      isCpuHigh: function (threshold?: number): boolean {
        throw new Error("Function not implemented.");
      },
      isMemoryOverLimit: function (): boolean {
        throw new Error("Function not implemented.");
      },
      reset: function (): void {
        throw new Error("Function not implemented.");
      },
      toJSON: function (): MonitorData {
        throw new Error("Function not implemented.");
      },
      clone: function (): MonitorData {
        throw new Error("Function not implemented.");
      }
    };
  }

  clone(): MonitorDataType {
    const entity = new MonitorDataType();
    entity.cpu = { ...this.cpu };
    entity.memory = { ...this.memory };
    return entity;
  }
}