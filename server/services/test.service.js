import { generateTestsForBatch } from "../llm/groq.js";


export class TestGenerator {
  constructor(batches) {
    this.batches = batches; // array of batches (each contains multiple files)
  }

  async run() {
    const allTests = [];

    let batchIndex = 0;

    for (const batch of this.batches) {
      batchIndex++;
      console.log(`[RepoPaglu] Processing batch ${batchIndex}/${this.batches.length}...`);

      try {
        const result = await generateTestsForBatch(batch);

        if (!Array.isArray(result)) {
          console.warn("[RepoPaglu] Bad batch result:", result);
          continue;
        }

        // Normalize results
        for (const item of result) {
          if (!item.file || !item.test) {
            console.warn("[RepoPaglu] Skipping invalid test item:", item);
            continue;
          }

          allTests.push({
            file: item.file,
            test: item.test,
          });
        }

      } catch (err) {
        console.error(`[RepoPaglu] Batch ${batchIndex} failed:`, err.message);
      }
    }

    return allTests;
  }
}



