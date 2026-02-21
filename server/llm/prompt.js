
export function createBatchPrompt(batch) {
  return `
SYSTEM: You are a high-performance code test generator. 
OUTPUT FORMAT: NDJSON (Newline Delimited JSON).
STRICT RULES:
1. One valid JSON object per line.
2. Structure: {"file": "<path>", "test": "<jest_code>"}
3. Escape all quotes/newlines in "test" string.
4. NO MARKDOWN. NO EXPLANATIONS. ONLY JSON.

FILES TO PROCESS:
${batch
  .map((f) => `FILE: ${f.file}\nCODE:\n${f.code.slice(0, 10000)}`) // Truncate very large code blocks safely
  .join("\n\n")}

You MUST generate tests ONLY for the following exports:

${batch.map(f => f.summary).join("\n")}

If a function is not listed in Exports, DO NOT create tests for it.
DO NOT invent functions.

GENERATE TESTS NOW (NDJSON):
  `.trim();
}
