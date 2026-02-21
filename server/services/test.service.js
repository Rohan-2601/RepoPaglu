import { generateWithHF } from "../llm/groq.js";
import { createBatchPrompt } from "../llm/prompt.js";
import { safeJsonParse } from "../utils/parseJson.js";

export async function generateTestsForBatch(batch) {
  const prompt = createBatchPrompt(batch);

  const output = await generateWithHF(prompt);

  let parsed;

  try {
    parsed = safeJsonParse(output);
  } catch (err) {
    // retry once with correction instruction
    const retry = await generateWithHF(
      `Your previous response was invalid JSON.
Return ONLY valid JSON array in this format:
[
  { "file": "string", "test": "string" }
]
No explanation.`
    );

    parsed = safeJsonParse(retry);
  }

  if (!Array.isArray(parsed)) {
    throw new Error("AI did not return JSON array.");
  }

  return parsed.filter(obj => obj.file && obj.test);
}


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



