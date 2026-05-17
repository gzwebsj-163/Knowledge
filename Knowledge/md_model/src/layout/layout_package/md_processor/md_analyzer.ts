import { OptimizedDiffMatrixLayout } from '../optimized';
import { CachedDiffMatrixLayout } from '../cached';
import { PersistentDiffMatrixLayout } from '../persistent';
import { MonitoredDiffMatrixLayout } from '../monitored';
import { DiffTypeIndex } from '../../layout';
import type { DiffMatrixCell } from '../../layout';
import { ShardType } from '../../../types/shard.type';
import * as fs from 'fs';
import * as path from 'path';
import { log } from 'console';

export enum MDAnalysisType {
  ALGORITHM = 0,
  THEORY = 1,
  SUMMARY = 2,
  INTERVIEW = 3,
  TOOL = 4,
  OTHER = 5
}
export interface MDFileMetadata {
  filePath: string;
  fileName: string;
  title: string;
  content: string;
  category: MDAnalysisType;
  tags: string[];
  wordCount: number;
  created: Date;
  modified: Date;
  importance: number;
}
export class MDMindMapAnalyzer {
  private layout: OptimizedDiffMatrixLayout;
  private cache: CachedDiffMatrixLayout;
  private persistence: PersistentDiffMatrixLayout;
  private monitor: MonitoredDiffMatrixLayout;
  private mdFiles: Map<string, MDFileMetadata> = new Map();
  private categoryKeywords: Map<MDAnalysisType, string[]> = new Map();
  constructor(
    private mdDirectory: string = './md_processor/md_file',
    storagePath: string = './data/md-analysis'
  ) {
    this.initializeCategoryKeywords();
    const mockShards: ShardType[] = [
      new ShardType('md-core', 'primary', 'synced', 100, 10),
      new ShardType('md-analysis', 'slave', 'synced', 90, 20),
      new ShardType('md-export', 'slave', 'synced', 80, 30)
    ];
    const mockLimits = [{ maxFiles: 1000 }];
    const mockInstructions = [{ type: 'analyze', params: [] }];
    const mockMonitors = [{ timestamp: Date.now(), metrics: {} }];
    const mockRawStates = [{ data: 'initialized' }];
    this.layout = new OptimizedDiffMatrixLayout(mockShards, mockLimits, mockInstructions, mockMonitors, mockRawStates);
    this.cache = new CachedDiffMatrixLayout(mockShards, mockLimits, mockInstructions, mockMonitors, mockRawStates);
    this.persistence = new PersistentDiffMatrixLayout(mockShards, mockLimits, mockInstructions, mockMonitors, mockRawStates, storagePath);
    this.monitor = new MonitoredDiffMatrixLayout(mockShards, mockLimits, mockInstructions, mockMonitors, mockRawStates);
    this.loadExistingAnalysis();
  }
  private initializeCategoryKeywords(): void {
    this.categoryKeywords.set(MDAnalysisType.ALGORITHM, [
      '算法', '题解', 'LeetCode', '力扣', '编程题', '代码', '实现',
      '0001', '0002', '0003', '动态规划', '贪心', '回溯', 'DFS', 'BFS'
    ]);

    this.categoryKeywords.set(MDAnalysisType.THEORY, [
      '理论基础', '基础', '概念', '原理', '数据结构', '复杂度', '时间空间'
    ]);

    this.categoryKeywords.set(MDAnalysisType.SUMMARY, [
      '总结', '总结篇', '汇总', '复习', '要点', '重点'
    ]);

    this.categoryKeywords.set(MDAnalysisType.INTERVIEW, [
      '面试题', '面试', '笔试', '面经', '剑指Offer'
    ]);

    this.categoryKeywords.set(MDAnalysisType.TOOL, [
      '.sh', '.py', '脚本', '工具', 'github', 'GitHub'
    ]);
  }
  public async analyzeMDFiles(): Promise<void> {
    const startTime = Date.now();
    const files = this.scanMDFiles();
    for (const file of files) {
      try {
        const metadata = await this.analyzeSingleFile(file);
        this.mdFiles.set(file, metadata);
      } catch (error) {
        log(error);
      }
    }
    this.updateLayout();
    this.persistence.saveToDisk('md-analysis.json');
    Date.now() - startTime;
  }

  private scanMDFiles(): string[] {
    const files: string[] = [];
    const scanDirectory = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    };

    scanDirectory(this.mdDirectory);
    return files;
  }
  private async analyzeSingleFile(filePath: string): Promise<MDFileMetadata> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const stat = fs.statSync(filePath);
    const title = this.extractTitle(content);
    const category = this.categorizeFile(filePath, content, title);
    const tags = this.extractTags(content, title);
    const wordCount = this.countWords(content);
    const importance = this.calculateImportance(content, category, tags);
    return {
      filePath,
      fileName: path.basename(filePath),
      title,
      content,
      category,
      tags,
      wordCount,
      created: stat.birthtime,
      modified: stat.mtime,
      importance
    };
  }
  private extractTitle(content: string): string {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return trimmed.substring(2).trim();
      }
    }
    return 'not define';
  }
  private categorizeFile(filePath: string, content: string, title: string): MDAnalysisType {
    const fileName = path.basename(filePath).toLowerCase();
    const contentLower = content.toLowerCase();
    const titleLower = title.toLowerCase();
    if (fileName.endsWith('.sh') || fileName.endsWith('.py')) {
      return MDAnalysisType.TOOL;
    }
    for (const [category, keywords] of this.categoryKeywords) {
      for (const keyword of keywords) {
        if (fileName.includes(keyword.toLowerCase()) ||
          titleLower.includes(keyword.toLowerCase()) ||
          contentLower.includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }

    return MDAnalysisType.OTHER;
  }
  private extractTags(content: string, title: string): string[] {
    const tags: string[] = [];
    const text = (title + ' ' + content).toLowerCase();
    const tagMappings: { [key: string]: string[] } = {
      '算法': ['算法', 'algorithm'],
      '数据结构': ['数据结构', '树', '图', '链表', '数组', '栈', '队列'],
      '动态规划': ['动态规划', 'DP'],
      '贪心': ['贪心', 'greedy'],
      '回溯': ['回溯', 'backtracking'],
      '排序': ['排序', 'sort'],
      '搜索': ['搜索', 'BFS', 'DFS'],
      '数学': ['数学', 'math'],
      '字符串': ['字符串', 'string'],
      '数组': ['数组', 'array'],
      '链表': ['链表', 'linked list'],
      '树': ['树', 'tree', '二叉树'],
      '图': ['图', 'graph'],
      '栈': ['栈', 'stack'],
      '队列': ['队列', 'queue'],
      '哈希': ['哈希', 'hash', '哈希表'],
      '双指针': ['双指针', 'two pointers'],
      '滑动窗口': ['滑动窗口', 'sliding window']
    };
    for (const [tag, keywords] of Object.entries(tagMappings)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          tags.push(tag);
          break;
        }
      }
    }
    return [...new Set(tags)];
  }
  private countWords(content: string): number {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }
  private calculateImportance(content: string, category: MDAnalysisType, tags: string[]): number {
    let importance = 0.5;
    const categoryWeights: { [key: number]: number } = {
      [MDAnalysisType.ALGORITHM]: 0.8,
      [MDAnalysisType.THEORY]: 0.9,
      [MDAnalysisType.SUMMARY]: 0.7,
      [MDAnalysisType.INTERVIEW]: 0.6,
      [MDAnalysisType.TOOL]: 0.4,
      [MDAnalysisType.OTHER]: 0.3
    };
    importance = categoryWeights[category] || 0.5;
    importance += Math.min(tags.length * 0.05, 0.2);
    const lengthBonus = Math.min(content.length / 10000, 0.2);
    importance += lengthBonus;
    return Math.min(importance, 1.0);
  }

  private updateLayout(): void {
    const cells: DiffMatrixCell<MDFileMetadata>[] = Array.from(this.mdFiles.values()).map((metadata, index) => ({
      typeIndex: metadata.category as unknown as DiffTypeIndex,
      data: metadata,
      featureCode: metadata.fileName,
      driftCode: '',
      diffScore: metadata.importance,
      shardId: metadata.fileName,
      position: [Math.floor(index / 10), index % 10],
      locked: false
    }));

    const rows = Math.ceil(Math.sqrt(this.mdFiles.size));
    const cols = rows;
    this.layout.buildMatrix(rows, cols);
  }
  private loadExistingAnalysis(): void {
    try {
      const files = this.persistence.listSavedFiles();
      if (files.length > 0) {
        const latestFile = files[0];
        this.persistence.loadFromDisk(latestFile);
      }
    } catch (error) {
      log(error);
    }
  }

  public getCategoryStats(): { [key in MDAnalysisType]: number } {
    const stats = {} as { [key in MDAnalysisType]: number };
    for (const type of Object.values(MDAnalysisType)) {
      if (typeof type === 'number') {
        stats[type] = 0;
      }
    }
    for (const metadata of this.mdFiles.values()) {
      stats[metadata.category]++;
    }
    return stats;
  }
  public getFilesByCategory(category: MDAnalysisType): MDFileMetadata[] {
    return Array.from(this.mdFiles.values()).filter(md => md.category === category);
  }
  public searchFiles(query: string, category?: MDAnalysisType): MDFileMetadata[] {
    const results: MDFileMetadata[] = [];
    const queryLower = query.toLowerCase();
    for (const metadata of this.mdFiles.values()) {
      if (category !== undefined && metadata.category !== category) continue;
      const matches = metadata.title.toLowerCase().includes(queryLower) ||
        metadata.content.toLowerCase().includes(queryLower) ||
        metadata.tags.some(tag => tag.toLowerCase().includes(queryLower));
      if (matches) {
        results.push(metadata);
      }
    }

    return results.sort((a, b) => b.importance - a.importance);
  }
  public getPopularTags(limit: number = 10): Array<{ tag: string; count: number }> {
    const tagCount = new Map<string, number>();
    for (const metadata of this.mdFiles.values()) {
      for (const tag of metadata.tags) {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      }
    }
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }
  public exportMindMap(category?: MDAnalysisType): string {
    let markdown = '# MD文件思维导图\n\n';
    const files = category !== undefined ?
      this.getFilesByCategory(category) :
      Array.from(this.mdFiles.values());
    const grouped = new Map<MDAnalysisType, MDFileMetadata[]>();
    for (const file of files) {
      if (!grouped.has(file.category)) {
        grouped.set(file.category, []);
      }
      grouped.get(file.category)!.push(file);
    }
    for (const [cat, catFiles] of grouped) {
      markdown += `## ${MDAnalysisType[cat]}\n\n`;
      for (const file of catFiles.sort((a, b) => b.importance - a.importance)) {
        markdown += `### ${file.title}\n\n`;
        markdown += `- **文件**: ${file.fileName}\n`;
        markdown += `- **标签**: ${file.tags.join(', ') || '无'}\n`;
        markdown += `- **词数**: ${file.wordCount}\n`;
        markdown += `- **重要性**: ${Math.round(file.importance * 100)}%\n\n`;
        const preview = file.content.substring(0, 200).replace(/\n/g, ' ');
        markdown += `**预览**: ${preview}...\n\n`;
      }
    }
    return markdown;
  }
  public getAnalysisStats(): {
    totalFiles: number;
    categories: { [key in MDAnalysisType]: number };
    totalWords: number;
    avgImportance: number;
    popularTags: Array<{ tag: string; count: number }>;
  } {
    const categories = this.getCategoryStats();
    const totalWords = Array.from(this.mdFiles.values()).reduce((sum, md) => sum + md.wordCount, 0);
    const avgImportance = Array.from(this.mdFiles.values()).reduce((sum, md) => sum + md.importance, 0) / this.mdFiles.size;
    return {
      totalFiles: this.mdFiles.size,
      categories,
      totalWords,
      avgImportance: avgImportance || 0,
      popularTags: this.getPopularTags(5)
    };
  }
}