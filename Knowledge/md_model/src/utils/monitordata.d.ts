export interface MonitorData {
  cpu: { usage?: number };
  memory: { usedMB?: number; limitMB?: number };
}

export class MonitorData implements MonitorData {
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
      memory: { ...this.memory }
    };
  }

  clone(): MonitorData {
    const entity = new MonitorData();
    entity.cpu = { ...this.cpu };
    entity.memory = { ...this.memory };
    return entity;
  }
}