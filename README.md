# 思维导图知识库管理系统开发文档
文档版本: v1.0
开发语言: TypeScript / Node.js
文档类型: 标准开发接口文档
项目名称: MarkdownMindMapKnowledgeBase 结构化知识库
线上演示地址：https://open-md.inscode.cc/index.html
![功能演示](https://github.com/gzwebsj-163/Knowledge/blob/main/img.png?raw=true)
---

## 目录
1. 项目介绍
2. 环境与引入方式
3. 核心枚举定义
4. 数据结构定义
5. 类实例化初始化
6. 核心API接口
7. 完整业务演示示例
8. 导出格式说明
9. 知识库统计字段
10. 使用场景与扩展方向

---

## 1. 项目介绍
### 1.1 功能概述
本系统是一款结构化思维导图知识库管理工具，支持本地持久化存储知识节点、构建知识关联关系、标签分类检索、智能关联推荐，支持一键导出 Markdown 思维导图、Mermaid 流程图，适用于技术知识库、学习体系搭建、业务文档管理、AI 知识图谱构建等场景。

### 1.2 核心特性
- 本地目录持久化存储，无需数据库
- 自由定义知识节点内容、标签、权重
- 支持父子、前置依赖等多种知识关联关系
- 关键词+标签联合精准搜索
- 基于内容相似度智能推荐关联知识
- 标准 Markdown / Mermaid 双向导出
- 全自动知识库数据统计分析

---

## 2. 环境与引入方式
### 运行环境
- Node.js 16+
- ESModule 模块化规范
- 

### 模块引入
```typescript
import { 
  MarkdownMindMapKnowledgeBase, 
  MindMapConnection 
} from './md_model/src/layout/layout_package/knowledge-base';
