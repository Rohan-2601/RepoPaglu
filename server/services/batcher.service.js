import path from 'path';

export class Batcher {
  constructor(files, summaries, ragEngine) {
    this.files = files;
    this.summaries = summaries;
    this.rag = ragEngine;
    this.batchSize = 3;
  }

  async createBatches() {
    const batches = [];
    let current = [];

    // FILE FILTERING RULES
    const IGNORED_EXTENSIONS = new Set([
      ".json", ".md", ".txt", ".lock", ".svg", ".png", ".jpg", 
      ".css", ".scss", ".map", ".xml", ".yaml", ".yml"
    ]);

    for (const file of this.files) {
      const ext = path.extname(file.relative).toLowerCase();
      const lowerPath = file.relative.toLowerCase();

      // 1. Skip non-code files
      if (IGNORED_EXTENSIONS.has(ext)) continue;

      // 2. Skip tests, build artifacts, and config
      if (
        lowerPath.includes(".test.") || 
        lowerPath.includes(".spec.") ||
        lowerPath.includes("node_modules") ||
        lowerPath.includes("dist/") ||
        lowerPath.includes("build/")
      ) {
        continue;
      }

      // 3. Skip large files (> 25KB) to save tokens
      if (file.content.length > 25000) {
        console.log(`⚠️ Skipping large file: ${file.relative} (${file.content.length} chars)`);
        continue;
      }

      const summary = this.summaries[file.relative];

      let context = {};
      try {
        context = await this.rag.getContextForFile(file.relative, summary);
      } catch (err) {
        console.error("RAG context error:", err.message);
      }

      current.push({
        file: file.relative,
        code: file.content,
        summary,
        context: {} // disable RAG for now
      });

      if (current.length >= this.batchSize) {
        batches.push(current);
        current = [];
      }
    }

    if (current.length > 0) batches.push(current);

    return batches;
  }
}


