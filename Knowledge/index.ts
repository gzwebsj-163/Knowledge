import { MarkdownMindMapKnowledgeBase, MindMapConnection } from './md_model/src/layout/layout_package/knowledge-base';

async function demonstrateKnowledgeBase() {
  console.log('🚀 初始化Markdown思维逻辑知识库...\n');

  const kb = new MarkdownMindMapKnowledgeBase('./data/demo-knowledge-base');
  kb.addNode({
    id: 'ai-concepts',
    title: '人工智能基础概念',
    content: '人工智能是计算机科学的一个分支，致力于创建能够模拟人类智能的系统。主要包括机器学习、深度学习、自然语言处理等子领域。',
    tags: ['AI', '基础概念', '技术'],
    connections: [],
    importance: 0.9
  });

  kb.addNode({
    id: 'machine-learning',
    title: '机器学习',
    content: '机器学习是AI的核心，通过算法让计算机从数据中学习模式，而无需显式编程。包括监督学习、无监督学习和强化学习。',
    tags: ['AI', '机器学习', '算法'],
    connections: [],
    importance: 0.8
  });

  kb.addNode({
    id: 'deep-learning',
    title: '深度学习',
    content: '深度学习使用多层神经网络模拟人脑处理信息的方式。基于神经网络技术，在图像识别、自然语言处理等领域取得了突破性进展。',
    tags: ['AI', '深度学习', '神经网络'],
    connections: [],
    importance: 0.8
  });

  kb.addNode({
    id: 'neural-networks',
    title: '神经网络',
    content: '神经网络是受生物神经系统启发的计算模型，由相互连接的节点（神经元）组成，能够学习复杂的模式和关系。',
    tags: ['AI', '神经网络', '计算模型'],
    connections: [],
    importance: 0.7
  });

  kb.addNode({
    id: 'nlp',
    title: '自然语言处理',
    content: '自然语言处理让计算机能够理解、解释和生成人类语言。包括文本分析、机器翻译、情感分析等应用。',
    tags: ['AI', 'NLP', '语言处理'],
    connections: [],
    importance: 0.7
  });

  kb.addNode({
    id: 'computer-vision',
    title: '计算机视觉',
    content: '计算机视觉使计算机能够从图像和视频中提取有意义的信息。包括图像识别、目标检测、图像生成等技术。',
    tags: ['AI', '计算机视觉', '图像处理'],
    connections: [],
    importance: 0.7
  });

  console.log('🔗 建立知识连接...');
  kb.addConnection('ai-concepts', 'machine-learning', MindMapConnection.PARENT_CHILD);
  kb.addConnection('ai-concepts', 'nlp', MindMapConnection.PARENT_CHILD);
  kb.addConnection('ai-concepts', 'computer-vision', MindMapConnection.PARENT_CHILD);
  kb.addConnection('machine-learning', 'deep-learning', MindMapConnection.PARENT_CHILD);
  kb.addConnection('deep-learning', 'neural-networks', MindMapConnection.PREREQUISITE);
  console.log('演示搜索功能...');
  const searchResults = kb.searchNodes('学习', ['AI']);
  console.log(`搜索"学习"相关节点（标签包含AI）: 找到 ${searchResults.length} 个结果`);
  searchResults.forEach(node => console.log(`  - ${node.title}`));
  console.log('\n智能推荐连接...');
  const recommendations = kb.recommendConnections('machine-learning');
  console.log(`为"机器学习"推荐的连接:`);
  recommendations.forEach(node => console.log(`  - ${node.title} (相似度: ${(recommendations.find(r => r.id === node.id)?.importance || 0 * 100).toFixed(0)}%)`));
  console.log('\n导出Markdown思维导图...');
  const markdownOutput = kb.exportToMarkdown('ai-concepts');
  console.log('Markdown导出完成，长度:', markdownOutput.length, '字符');
  console.log('\n--- Markdown思维导图预览 ---');
  console.log(markdownOutput.substring(0, 500) + '...\n');
  console.log('导出Mermaid思维导图...');
  const mermaidOutput = kb.exportToMermaid('ai-concepts');
  console.log('Mermaid导出完成，长度:', mermaidOutput.length, '字符');
  console.log('\n--- Mermaid思维导图预览 ---');
  console.log(mermaidOutput.substring(0, 300) + '...\n');
  console.log('知识库统计信息:');
  const stats = kb.getStats();
  console.log(`  - 总节点数: ${stats.totalNodes}`);
  console.log(`  - 总连接数: ${stats.totalConnections}`);
  console.log(`  - 平均重要性: ${(stats.avgImportance * 100).toFixed(1)}%`);
  console.log(`  - 热门标签: ${stats.topTags.join(', ')}`);
  console.log('\n演示完成！知识库已保存到磁盘。');
}
demonstrateKnowledgeBase().catch(console.error);