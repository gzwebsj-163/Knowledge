import { DiffMatrixLayout } from '../index';
import { DiffTypeIndex } from '../layout';
import type { DiffMatrixCell } from '../layout';
import { ShardType } from '../../types/shard.type';
import * as fs from 'fs';
import * as path from 'path';

export class PersistentDiffMatrixLayout extends DiffMatrixLayout {
  private storagePath: string;
  private autoSave: boolean;
  private saveInterval: number;
  private lastSaveTime: number = 0;
  private backupDir: string = './data/backup';

  constructor(
    shards: ShardType[],
    limits: any[],
    instructions: any[],
    monitors: any[],
    rawStates: any[],
    storagePath: string = './data/matrix',
    autoSave: boolean = true,
    saveInterval: number = 30000
  ) {
    super(shards, limits, instructions, monitors, rawStates);
    this.storagePath = storagePath;
    this.autoSave = autoSave;
    this.saveInterval = saveInterval;
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }

    if (autoSave) {
      this.startAutoSave();
    }
  }

  private startAutoSave(): void {
    setInterval(() => {
      if (Date.now() - this.lastSaveTime > this.saveInterval) {
        this.saveToDisk();
      }
    }, this.saveInterval);
  }

  public saveToDisk(filename?: string): void {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = filename || `matrix-${timestamp}.json`;
      const filePath = path.join(this.storagePath, fileName);

      const data = {
        matrix: this.getMatrixData(),
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0',
          checksum: this.calculateChecksum()
        }
      };

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      this.lastSaveTime = Date.now();
      this.cleanupOldFiles();
    } catch (error) {
      console.error('Failed to save matrix to disk:', error);
    }
  }

  private getMatrixData(): DiffMatrixCell<unknown>[][] {
    return (this as any).matrix || [];
  }

  private calculateChecksum(): string {
    const data = JSON.stringify(this.getMatrixData());
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  private cleanupOldFiles(): void {
    try {
      const files = fs.readdirSync(this.storagePath)
        .filter(file => file.startsWith('matrix-') && file.endsWith('.json'))
        .sort()
        .reverse();

      if (files.length > 5) {
        files.slice(5).forEach(file => {
          fs.unlinkSync(path.join(this.storagePath, file));
        });
      }
    } catch (error) {
      console.error('Failed to cleanup old files:', error);
    }
  }

  public loadFromDisk(filename: string): boolean {
    try {
      const filePath = path.join(this.storagePath, filename);
      if (!fs.existsSync(filePath)) {
        return false;
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (data.metadata?.checksum !== this.calculateChecksum()) {
        console.warn('Checksum mismatch, data may be corrupted');
      }
      this.restoreMatrixData(data.matrix);
      return true;
    } catch (error) {
      console.error('Failed to load matrix from disk:', error);
      return false;
    }
  }

  private restoreMatrixData(matrix: DiffMatrixCell<unknown>[][]): void {
    (this as any).matrix = matrix;
  }

  public listSavedFiles(): string[] {
    try {
      return fs.readdirSync(this.storagePath)
        .filter(file => file.startsWith('matrix-') && file.endsWith('.json'))
        .sort()
        .reverse();
    } catch (error) {
      console.error('Failed to list saved files:', error);
      return [];
    }
  }

  public exportToCompressedFile(filename: string): void {
    const data = JSON.stringify({
      matrix: this.getMatrixData(),
      compressed: true,
      timestamp: new Date().toISOString()
    });

    const filePath = path.join(this.storagePath, `${filename}.compressed.json`);
    fs.writeFileSync(filePath, data);
  }

  public importFromCompressedFile(filename: string): boolean {
    try {
      const filePath = path.join(this.storagePath, filename);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      if (data.compressed) {
        this.restoreMatrixData(data.matrix);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import from compressed file:', error);
      return false;
    }
  }

  public getStorageStats(): { totalFiles: number; totalSize: number; lastSave: string } {
    try {
      const files = this.listSavedFiles();
      let totalSize = 0;

      files.forEach(file => {
        const stats = fs.statSync(path.join(this.storagePath, file));
        totalSize += stats.size;
      });

      return {
        totalFiles: files.length,
        totalSize,
        lastSave: new Date(this.lastSaveTime).toISOString()
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return { totalFiles: 0, totalSize: 0, lastSave: 'unknown' };
    }
  }
  public createBackup(backupFilename = null) {
    try {
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }
      const filename = backupFilename || `layout_backup_${Date.now()}.json`;
      const backupPath = path.join(this.backupDir, filename);
      const data = JSON.stringify(this.matrix, null, 2);
      fs.writeFileSync(backupPath, data, 'utf8');

      return {
        success: true,
        backupPath,
        size: data.length,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error('Backup failed:', err);
      return { success: false, error: err.message };
    }
  }
}