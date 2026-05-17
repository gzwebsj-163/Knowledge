import { MDMindMapAnalyzer, MDAnalysisType } from './md_analyzer';

export async function demonstrateMDAnalyzer() {
  const analyzer = new MDMindMapAnalyzer();
  await analyzer.analyzeMDFiles();
  const stats = analyzer.getAnalysisStats();
  for (const [category, count] of Object.entries(stats.categories)) {
    if (count > 0) {
      console.log(`  - ${MDAnalysisType[parseInt(category)]}: ${count} 个文件`);
    }
  }
  const searchResults = analyzer.searchFiles('动态规划');
  searchResults.slice(0, 3).forEach(file => {
    console.log(`  - ${file.title} (${file.tags.join(', ')})`);
  });
  const algorithmFiles = analyzer.getFilesByCategory(MDAnalysisType.ALGORITHM);
  algorithmFiles.slice(0, 5).forEach(file => {
    console.log(`  - ${file.fileName}: ${file.title}`);
  });
  analyzer.exportMindMap();
}
demonstrateMDAnalyzer().catch(console.error);