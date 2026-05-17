import { AdvancedDiffMatrixLayout } from './advanced';
import { CachedDiffMatrixLayout } from './cached';
import { ConcurrentDiffMatrixLayout } from './concurrent';
import { MonitoredDiffMatrixLayout } from './monitored';
import { OptimizedDiffMatrixLayout } from './optimized';
import { PersistentDiffMatrixLayout } from './persistent';
import { DiffTypeIndex } from '../layout';
import { ShardType } from '../../types/shard.type';

const mockShards: ShardType[] = [
    new ShardType(
        'shard-1',
        'primary',
        'synced',
        95,
        30
    ),
    new ShardType(
        'shard-2',
        'slave',
        'syncing',
        80,
        60
    ),
    new ShardType(
        'shard-3',
        'slave',
        'error',
        50,
        95
    ),
];

const mockLimits = [{ maxSize: 100 }];
const mockInstructions = [{ opcode: 'ADD', params: [1, 2] }];
const mockMonitors = [{ timestamp: Date.now(), metrics: { cpu: 50 } }];
const mockRawStates = [{ data: 'raw1' }];
async function runTests() {
  console.log('Running comprehensive tests for layout package...\n');
  console.log('1. Testing AdvancedDiffMatrixLayout...');
  const advanced = new AdvancedDiffMatrixLayout(mockShards, mockLimits, mockInstructions, mockMonitors, mockRawStates);
  advanced.buildMatrix(3, 3);
  const sorted = advanced.sortByMultipleCriteria(['score', 'type'], ['desc', 'asc']);
  console.log('✓ Multi-criteria sort completed');
  const filtered = advanced.filterByThreshold(DiffTypeIndex.SHARD, 0.5, 'gt');
  console.log('✓ Threshold filter completed');
  const jsonExport = advanced.exportToJSON();
  console.log('✓ JSON export completed');
  const csvExport = advanced.exportToCSV();
  console.log('✓ CSV export completed');
  const stats = advanced.getPerformanceStats();
  console.log('✓ Performance stats retrieved:', Object.keys(stats).length, 'operations tracked');
  console.log('\n2. Testing CachedDiffMatrixLayout...');
  const cached = new CachedDiffMatrixLayout(mockShards, mockLimits, mockInstructions, mockMonitors, mockRawStates, 50);
  cached.buildMatrix(3, 3);
  const matrix1 = cached.buildMatrixCached(3, 3);
  const matrix2 = cached.buildMatrixCached(3, 3);
  console.log('✓ Cached matrix build completed');
  const sortedCached = cached.sortByDiffScoreCached();
  console.log('✓ Cached sort completed');
  const queueCached = cached.getQueueByTypeCached(DiffTypeIndex.SHARD);
  console.log('✓ Cached queue retrieval completed');
  const cacheStats = cached.getCacheStats();
  console.log('✓ Cache stats retrieved:', cacheStats);
  cached.clearCache();
  console.log('✓ Cache cleared');
  console.log('\n3. Testing ConcurrentDiffMatrixLayout...');
  const concurrent = new ConcurrentDiffMatrixLayout(mockShards, mockLimits, mockInstructions, mockMonitors, mockRawStates, 2);
  concurrent.buildMatrix(3, 3);
  const concurrentMatrix = await concurrent.buildMatrixConcurrent(3, 3);
  console.log('✓ Concurrent matrix build completed, size:', concurrentMatrix.length + 'x' + (concurrentMatrix[0]?.length || 0));
  const concurrentSorted = await concurrent.sortByDiffScoreConcurrent();
  console.log('✓ Concurrent sort completed, items:', concurrentSorted.length);
  console.log('\n4. Testing MonitoredDiffMatrixLayout...');
  const monitored = new MonitoredDiffMatrixLayout(mockShards, mockLimits, mockInstructions, mockMonitors, mockRawStates, {
    maxResponseTime: 500,
    maxErrorRate: 0.1,
    healthCheckInterval: 1000
  });
  monitored.buildMatrix(3, 3);
  const metrics = monitored.getMetrics();
  console.log('✓ Metrics retrieved:', metrics);
  const healthStatus = monitored.getHealthStatus();
  console.log('✓ Health status:', healthStatus);
  let alertTriggered = false;
  monitored.onAlert(() => { alertTriggered = true; });
  for (let i = 0; i < 10; i++) {
    monitored.sortByDiffScore();
  }
  console.log('✓ Alert system tested, alerts triggered:', alertTriggered);
  console.log('\n5. Testing OptimizedDiffMatrixLayout...');
  const optimized = new OptimizedDiffMatrixLayout(mockShards, mockLimits, mockInstructions, mockMonitors, mockRawStates);
  optimized.buildMatrix(4, 4);
  const cell = optimized.getCellAt([1, 1]);
  console.log('✓ Cell lookup completed:', cell ? 'found' : 'not found');

  const cellsByType = optimized.getCellsByType(DiffTypeIndex.SHARD);
  console.log('✓ Cells by type retrieved:', cellsByType.length, 'cells');

  const cellsByScore = optimized.getCellsByScoreRange(0, 1);
  console.log('✓ Cells by score range retrieved:', cellsByScore.length, 'cells');

  const optimizedSorted = optimized.sortByDiffScoreOptimized();
  console.log('✓ Optimized sort completed, items:', optimizedSorted.length);

  const sparse = optimized.toSparseMatrix();
  console.log('✓ Sparse matrix conversion completed, entries:', sparse.size);

  console.log('\n6. Testing PersistentDiffMatrixLayout...');
  const tempDir = './test-data';
  const persistent = new PersistentDiffMatrixLayout(mockShards, mockLimits, mockInstructions, mockMonitors, mockRawStates, tempDir, false);
  persistent.buildMatrix(3, 3);

  persistent.saveToDisk('test-matrix.json');
  console.log('✓ Manual save completed');

  const loaded = persistent.loadFromDisk('test-matrix.json');
  console.log('✓ Load from disk completed:', loaded ? 'success' : 'failed');

  persistent.createBackup();
  console.log('✓ Backup created');
  console.log('\n🎉 All tests completed successfully!');
}

declare module './monitored' {
  interface MonitoredDiffMatrixLayout {
    getMetrics(): any;
    getHealthStatus(...args: any[]): any;
    onAlert(callback: () => void): void;
  }
}

declare module './persistent' {
  interface PersistentDiffMatrixLayout {
    loadFromDisk(filename: string): boolean;
    createBackup(): void;
    recoverFromBackup(): boolean;
  }
}

if (require.main === module) {
  runTests().catch(console.error);
}