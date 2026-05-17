import { CachedDiffMatrixLayout } from './cached';
import { MonitoredDiffMatrixLayout } from './monitored';
import { OptimizedDiffMatrixLayout } from './optimized';
import { PersistentDiffMatrixLayout } from './persistent';
import { DiffTypeIndex } from '../layout';
import type { DiffMatrixCell } from '../layout';
import { ShardType } from '../../types/shard.type';

export interface KnowledgeNode {
  id: string;
  title: string;
  content: string;
  tags: string[];
  connections: string[];
  importance: number;
  created: Date;
  updated: Date;
}
export enum MindMapConnection {
  PARENT_CHILD = 'parent-child',
  RELATED = 'related',
  PREREQUISITE = 'prerequisite',
  REFERENCE = 'reference'
}
export class MarkdownMindMapKnowledgeBase {
  private nodes: Map<string, KnowledgeNode> = new Map();
  private layout: OptimizedDiffMatrixLayout;
  private cache: CachedDiffMatrixLayout;
  private persistence: PersistentDiffMatrixLayout;
  private monitor: MonitoredDiffMatrixLayout;

  constructor(storagePath: string = './data/knowledge-base') {
    const mockShards: ShardType[] = [
      new ShardType('knowledge-core', 'primary', 'synced', 100, 10),
      new ShardType('mindmap-layout', 'slave', 'synced', 90, 20),
      new ShardType('markdown-export', 'slave', 'synced', 80, 30)
    ];
    const mockLimits = [{ maxNodes: 10000 }];
    const mockInstructions = [{ type: 'build', params: [] }];
    const mockMonitors = [{ timestamp: Date.now(), metrics: {} }];
    const mockRawStates = [{ data: 'initialized' }];
    this.layout = new OptimizedDiffMatrixLayout(mockShards, mockLimits, mockInstructions, mockMonitors, mockRawStates);
    this.cache = new CachedDiffMatrixLayout(mockShards, mockLimits, mockInstructions, mockMonitors, mockRawStates);
    this.persistence = new PersistentDiffMatrixLayout(mockShards, mockLimits, mockInstructions, mockMonitors, mockRawStates, storagePath);
    this.monitor = new MonitoredDiffMatrixLayout(mockShards, mockLimits, mockInstructions, mockMonitors, mockRawStates);
    this.loadFromDisk();
  }

  public addNode(node: Omit<KnowledgeNode, 'created' | 'updated'>): void {
    const fullNode: KnowledgeNode = {
      ...node,
      created: new Date(),
      updated: new Date()
    };
    this.nodes.set(node.id, fullNode);
    this.updateLayout();
    this.persistence.saveToDisk(`node-${node.id}.json`);
  }
  public updateNode(id: string, updates: Partial<KnowledgeNode>): void {
    const existing = this.nodes.get(id);
    if (existing) {
      this.nodes.set(id, {
        ...existing,
        ...updates,
        updated: new Date()
      });
      this.updateLayout();
    }
  }
  public removeNode(id: string): void {
    this.nodes.delete(id);
    this.updateLayout();
  }
  public addConnection(fromId: string, toId: string, type: MindMapConnection = MindMapConnection.RELATED): void {
    const fromNode = this.nodes.get(fromId);
    const toNode = this.nodes.get(toId);
    if (fromNode && toNode && !fromNode.connections.includes(toId)) {
      fromNode.connections.push(toId);
      this.updateLayout();
    }
  }
  public getNodeWithConnections(id: string): KnowledgeNode & { connectedNodes: KnowledgeNode[] } | null {
    const node = this.nodes.get(id);
    if (!node) return null;
    const connectedNodes = node.connections
      .map(connId => this.nodes.get(connId))
      .filter(Boolean) as KnowledgeNode[];
    return { ...node, connectedNodes };
  }
  public searchNodes(query: string, tags?: string[]): KnowledgeNode[] {
    const results: KnowledgeNode[] = [];
    for (const node of this.nodes.values()) {
      const matchesQuery = node.title.toLowerCase().includes(query.toLowerCase()) ||
        node.content.toLowerCase().includes(query.toLowerCase());
      const matchesTags = !tags || tags.some(tag => node.tags.includes(tag));
      if (matchesQuery && matchesTags) {
        results.push(node);
      }
    }
    return results;
  }
  public exportToMarkdown(rootNodeId?: string): string {
    const visited = new Set<string>();
    let markdown = '# 思维导图知识库\n\n';
    if (rootNodeId) {
      const rootNode = this.nodes.get(rootNodeId);
      if (rootNode) {
        markdown += this.generateMindMapMarkdown(rootNode, 0, visited);
      }
    } else {
      const sortedNodes = Array.from(this.nodes.values())
        .sort((a, b) => b.importance - a.importance);
      for (const node of sortedNodes) {
        if (!visited.has(node.id)) {
          markdown += this.generateMindMapMarkdown(node, 0, visited);
        }
      }
    }
    return markdown;
  }

  private generateMindMapMarkdown(node: KnowledgeNode, depth: number, visited: Set<string>): string {
    if (visited.has(node.id)) return '';
    visited.add(node.id);
    const indent = '#'.repeat(Math.min(depth + 2, 6));
    let markdown = `${indent} ${node.title}\n\n`;
    if (node.content) {
      markdown += `${node.content}\n\n`;
    }
    if (node.tags.length > 0) {
      markdown += `**标签:** ${node.tags.join(', ')}\n\n`;
    }
    markdown += `**重要性:** ${Math.round(node.importance * 100)}%\n`;
    markdown += `**创建时间:** ${node.created.toLocaleString()}\n`;
    markdown += `**更新时间:** ${node.updated.toLocaleString()}\n\n`;
    for (const connId of node.connections) {
      const connectedNode = this.nodes.get(connId);
      if (connectedNode && !visited.has(connId)) {
        markdown += this.generateMindMapMarkdown(connectedNode, depth + 1, visited);
      }
    }

    return markdown;
  }
  public exportToMermaid(rootNodeId?: string): string {
    let mermaid = 'mindmap\n  root((知识库))\n';
    const processed = new Set<string>();
    if (rootNodeId) {
      const rootNode = this.nodes.get(rootNodeId);
      if (rootNode) {
        mermaid += this.generateMermaidNode(rootNode, 1, processed);
      }
    } else {
      const sortedNodes = Array.from(this.nodes.values())
        .sort((a, b) => b.importance - a.importance);
      for (const node of sortedNodes.slice(0, 10)) {
        if (!processed.has(node.id)) {
          mermaid += this.generateMermaidNode(node, 1, processed);
        }
      }
    }
    return mermaid;
  }

  private generateMermaidNode(node: KnowledgeNode, level: number, processed: Set<string>): string {
    if (processed.has(node.id)) return '';
    processed.add(node.id);
    const indent = '  '.repeat(level);
    let mermaid = `${indent}${node.id}[${node.title}]\n`;
    for (const connId of node.connections) {
      const connectedNode = this.nodes.get(connId);
      if (connectedNode && !processed.has(connId)) {
        mermaid += this.generateMermaidNode(connectedNode, level + 1, processed);
      }
    }
    return mermaid;
  }

  private updateLayout(): void {
    const cells: DiffMatrixCell<KnowledgeNode>[] = Array.from(this.nodes.values()).map((node, index) => ({
      typeIndex: DiffTypeIndex.SHARD,
      data: node,
      featureCode: node.id,
      driftCode: '',
      diffScore: node.importance,
      shardId: node.id,
      position: [Math.floor(index / 10), index % 10],
      locked: false
    }));
    const rows = Math.ceil(Math.sqrt(this.nodes.size));
    const cols = rows;
    this.layout.buildMatrix(rows, cols);
  }
  private loadFromDisk(): void {
  }

  public getStats(): {
    totalNodes: number;
    totalConnections: number;
    avgImportance: number;
    topTags: string[];
  } {
    const nodes = Array.from(this.nodes.values());
    const totalConnections = nodes.reduce((sum, node) => sum + node.connections.length, 0);
    const avgImportance = nodes.length > 0 ? nodes.reduce((sum, node) => sum + node.importance, 0) / nodes.length : 0;
    const tagCount = new Map<string, number>();
    nodes.forEach(node => {
      node.tags.forEach(tag => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });

    const topTags = Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    return {
      totalNodes: nodes.length,
      totalConnections,
      avgImportance,
      topTags
    };
  }

  public recommendConnections(nodeId: string): KnowledgeNode[] {
    const node = this.nodes.get(nodeId);
    if (!node) return [];
    const recommendations: Array<{ node: KnowledgeNode; score: number }> = [];
    for (const otherNode of this.nodes.values()) {
      if (otherNode.id === nodeId || node.connections.includes(otherNode.id)) continue;
      let score = 0;
      const commonTags = node.tags.filter(tag => otherNode.tags.includes(tag)).length;
      score += commonTags * 0.3;
      const titleSimilarity = this.calculateSimilarity(node.title, otherNode.title);
      score += titleSimilarity * 0.4;
      score += (node.importance + otherNode.importance) * 0.3;
      if (score > 0.5) {
        recommendations.push({ node: otherNode, score });
      }
    }
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.node);
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word)).length;
    const totalWords = new Set([...words1, ...words2]).size;
    return totalWords > 0 ? commonWords / totalWords : 0;
  }
}