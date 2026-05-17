export interface RawStateData {
  key: string;
  value: string;
  status: number;
  createTime: Date;
  shardId: string;
  shardRole: string;
}

export class RawStateData implements RawStateData {
  key: string;
  value: string;
  status: number;
  createTime: Date;
  shardId: string;
  shardRole: string;

  constructor(
    key: string,
    value: string,
    status: number,
    createTime: Date,
    shardId: string,
    shardRole: string
  ) {
    this.key = key;
    this.value = value;
    this.status = status;
    this.createTime = createTime;
    this.shardId = shardId;
    this.shardRole = shardRole;
  }

  getKey(): string {
    return this.key;
  }

  setKey(key: string): void {
    this.key = key;
  }

  getValue(): string {
    return this.value;
  }

  setValue(value: string): void {
    this.value = value;
  }

  getStatus(): number {
    return this.status;
  }

  setStatus(status: number): void {
    this.status = status;
  }

  getCreateTime(): Date {
    return this.createTime;
  }

  setCreateTime(time: Date): void {
    this.createTime = time;
  }

  getShardId(): string {
    return this.shardId;
  }

  setShardId(id: string): void {
    this.shardId = id;
  }

  getShardRole(): string {
    return this.shardRole;
  }

  setShardRole(role: string): void {
    this.shardRole = role;
  }

  isPrimaryShard(): boolean {
    return this.shardRole === 'primary';
  }

  isSlaveShard(): boolean {
    return this.shardRole === 'slave';
  }

  toJSON(): RawStateData {
    return {
      key: this.key,
      value: this.value,
      status: this.status,
      createTime: this.createTime,
      shardId: this.shardId,
      shardRole: this.shardRole
    };
  }

  clone(): RawStateData {
    return new RawStateData(
      this.key,
      this.value,
      this.status,
      new Date(this.createTime.getTime()),
      this.shardId,
      this.shardRole
    );
  }
}