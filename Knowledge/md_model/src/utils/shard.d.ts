export interface ShardInfo {
    shardId: string;
    role: 'primary' | 'slave';
    syncStatus: 'synced' | 'syncing' | 'error';
    healthScore: number;
    loadScore: number;
}
export class Shard implements ShardInfo {
    shardId: string;
    role: 'primary' | 'slave';
    syncStatus: 'synced' | 'syncing' | 'error';
    healthScore: number;
    loadScore: number;

    constructor(
        shardId: string,
        role: 'primary' | 'slave',
        syncStatus: 'synced' | 'syncing' | 'error',
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

    getRole(): 'primary' | 'slave' {
        return this.role;
    }

    setRole(role: 'primary' | 'slave'): void {
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

    getSyncStatus(): 'synced' | 'syncing' | 'error' {
        return this.syncStatus;
    }

    setSyncStatus(status: 'synced' | 'syncing' | 'error'): void {
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

    toJSON(): ShardInfo {
        return {
            shardId: this.shardId,
            role: this.role,
            syncStatus: this.syncStatus,
            healthScore: this.healthScore,
            loadScore: this.loadScore
        };
    }

    clone(): Shard {
        return new Shard(
            this.shardId,
            this.role,
            this.syncStatus,
            this.healthScore,
            this.loadScore
        );
    }
}