export type ShardRole = 'primary' | 'slave';
export type ShardSyncStatus = 'synced' | 'syncing' | 'error';
import { Shard, ShardInfo } from "../utils/shard";

export class ShardType implements Shard {
    shardId: string;
    role: ShardRole;
    syncStatus: ShardSyncStatus;
    healthScore: number;
    loadScore: number;

    constructor(
        shardId: string,
        role: ShardRole,
        syncStatus: ShardSyncStatus,
        healthScore: number,
        loadScore: number
    ) {
        this.shardId = shardId;
        this.role = role;
        this.syncStatus = syncStatus;
        this.healthScore = healthScore;
        this.loadScore = loadScore;
    }

    getShardId(): string {
        return this.shardId;
    }

    setShardId(shardId: string): void {
        this.shardId = shardId;
    }

    getRole(): ShardRole {
        return this.role;
    }

    setRole(role: ShardRole): void {
        this.role = role;
    }

    promoteToPrimary(): void {
        this.role = 'primary';
    }

    demoteToSlave(): void {
        this.role = 'slave';
    }

    isPrimary(): boolean {
        return this.role === 'primary';
    }

    isSlave(): boolean {
        return this.role === 'slave';
    }

    getSyncStatus(): ShardSyncStatus {
        return this.syncStatus;
    }

    setSyncStatus(status: ShardSyncStatus): void {
        this.syncStatus = status;
    }

    markSynced(): void {
        this.syncStatus = 'synced';
    }

    markSyncing(): void {
        this.syncStatus = 'syncing';
    }

    markSyncError(): void {
        this.syncStatus = 'error';
    }

    isSynced(): boolean {
        return this.syncStatus === 'synced';
    }

    isSyncing(): boolean {
        return this.syncStatus === 'syncing';
    }

    hasSyncError(): boolean {
        return this.syncStatus === 'error';
    }

    getHealthScore(): number {
        return this.healthScore;
    }

    setHealthScore(score: number): void {
        this.healthScore = Math.max(0, Math.min(100, score));
    }

    increaseHealthScore(value: number): void {
        this.setHealthScore(this.healthScore + value);
    }

    decreaseHealthScore(value: number): void {
        this.setHealthScore(this.healthScore - value);
    }

    isHealthy(): boolean {
        return this.healthScore >= 70;
    }

    getLoadScore(): number {
        return this.loadScore;
    }

    setLoadScore(score: number): void {
        this.loadScore = Math.max(0, Math.min(100, score));
    }

    increaseLoadScore(value: number): void {
        this.setLoadScore(this.loadScore + value);
    }

    decreaseLoadScore(value: number): void {
        this.setLoadScore(this.loadScore - value);
    }

    isLowLoad(): boolean {
        return this.loadScore <= 80;
    }

    isOverloaded(): boolean {
        return this.loadScore > 90;
    }

    toJSON(): Shard {
        return {
            shardId: this.shardId,
            role: this.role,
            syncStatus: this.syncStatus,
            healthScore: this.healthScore,
            loadScore: this.loadScore,
            getShardId: function (): string {
                throw new Error("Function not implemented.");
            },
            setShardId: function (shardId: string): void {
                throw new Error("Function not implemented.");
            },
            getRole: function (): "primary" | "slave" {
                throw new Error("Function not implemented.");
            },
            setRole: function (role: "primary" | "slave"): void {
                throw new Error("Function not implemented.");
            },
            promoteToPrimary: function (): void {
                throw new Error("Function not implemented.");
            },
            demoteToSlave: function (): void {
                throw new Error("Function not implemented.");
            },
            isPrimary: function (): boolean {
                throw new Error("Function not implemented.");
            },
            isSlave: function (): boolean {
                throw new Error("Function not implemented.");
            },
            getSyncStatus: function (): "synced" | "syncing" | "error" {
                throw new Error("Function not implemented.");
            },
            setSyncStatus: function (status: "synced" | "syncing" | "error"): void {
                throw new Error("Function not implemented.");
            },
            markSynced: function (): void {
                throw new Error("Function not implemented.");
            },
            markSyncing: function (): void {
                throw new Error("Function not implemented.");
            },
            markSyncError: function (): void {
                throw new Error("Function not implemented.");
            },
            isSynced: function (): boolean {
                throw new Error("Function not implemented.");
            },
            isSyncing: function (): boolean {
                throw new Error("Function not implemented.");
            },
            hasSyncError: function (): boolean {
                throw new Error("Function not implemented.");
            },
            getHealthScore: function (): number {
                throw new Error("Function not implemented.");
            },
            setHealthScore: function (score: number): void {
                throw new Error("Function not implemented.");
            },
            increaseHealthScore: function (value: number): void {
                throw new Error("Function not implemented.");
            },
            decreaseHealthScore: function (value: number): void {
                throw new Error("Function not implemented.");
            },
            isHealthy: function (): boolean {
                throw new Error("Function not implemented.");
            },
            getLoadScore: function (): number {
                throw new Error("Function not implemented.");
            },
            setLoadScore: function (score: number): void {
                throw new Error("Function not implemented.");
            },
            increaseLoadScore: function (value: number): void {
                throw new Error("Function not implemented.");
            },
            decreaseLoadScore: function (value: number): void {
                throw new Error("Function not implemented.");
            },
            isLowLoad: function (): boolean {
                throw new Error("Function not implemented.");
            },
            isOverloaded: function (): boolean {
                throw new Error("Function not implemented.");
            },
            toJSON: function (): ShardInfo {
                throw new Error("Function not implemented.");
            },
            clone: function (): Shard {
                throw new Error("Function not implemented.");
            }
        };
    }

    clone(): ShardType {
        return new ShardType(
            this.shardId,
            this.role,
            this.syncStatus,
            this.healthScore,
            this.loadScore
        );
    }
}