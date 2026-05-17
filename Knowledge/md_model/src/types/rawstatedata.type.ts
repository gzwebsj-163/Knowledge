import { RawStateData } from "../utils/rawstatedata";

export class RawStateDataType implements RawStateData {
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
      shardRole: this.shardRole,
      getKey: function (): string {
        throw new Error("Function not implemented.");
      },
      setKey: function (key: string): void {
        throw new Error("Function not implemented.");
      },
      getValue: function (): string {
        throw new Error("Function not implemented.");
      },
      setValue: function (value: string): void {
        throw new Error("Function not implemented.");
      },
      getStatus: function (): number {
        throw new Error("Function not implemented.");
      },
      setStatus: function (status: number): void {
        throw new Error("Function not implemented.");
      },
      getCreateTime: function (): Date {
        throw new Error("Function not implemented.");
      },
      setCreateTime: function (time: Date): void {
        throw new Error("Function not implemented.");
      },
      getShardId: function (): string {
        throw new Error("Function not implemented.");
      },
      setShardId: function (id: string): void {
        throw new Error("Function not implemented.");
      },
      getShardRole: function (): string {
        throw new Error("Function not implemented.");
      },
      setShardRole: function (role: string): void {
        throw new Error("Function not implemented.");
      },
      isPrimaryShard: function (): boolean {
        throw new Error("Function not implemented.");
      },
      isSlaveShard: function (): boolean {
        throw new Error("Function not implemented.");
      },
      toJSON: function (): RawStateData {
        throw new Error("Function not implemented.");
      },
      clone: function (): RawStateData {
        throw new Error("Function not implemented.");
      }
    };
  }

  clone(): RawStateDataType {
    return new RawStateDataType(
      this.key,
      this.value,
      this.status,
      new Date(this.createTime.getTime()),
      this.shardId,
      this.shardRole
    );
  }
}