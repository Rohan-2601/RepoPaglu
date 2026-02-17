import { generateWithHF, streamWithHF } from "../llm/groq.js";

// ... (keep extractControllerInfo as is)
export function extractControllerInfo(files) {
  const controllers = [];
  for (const file of files) {
      if (file.content.length > 50000) continue; // Skip huge files for regex scan

      if (
          file.relative.toLowerCase().includes("controller") || 
          file.relative.toLowerCase().includes("route") ||
          file.content.includes("express.Router") ||
          file.content.includes("app.get") ||
          file.content.includes("app.post")
      ) {
          controllers.push({
              file: file.relative,
              content: file.content
          });
      }
  }
  return controllers;
}

/**
 * Generate STRUCTURED JSON API documentation using AI (Streamed)
 */
export async function generateApiDocs(controllerData, res) {
  const prompt = `
You are an API documentation extractor.

Analyze the following Express.js controller files and extract structured API documentation.

### OUTPUT FORMAT (STRICT JSON ONLY):
Return a JSON array. Each item must be:

{
  "controller": "string",
  "routes": [
    {
      "method": "GET" | "POST" | "PUT" | "DELETE",
      "path": "string",
      "description": "string",
      "authRequired": boolean,
      "params": { "...": "string" },
      "query": { "...": "string" },
      "body": { "...": "string" },
      "responses": {
        "200": "string",
        "400": "string",
        "401": "string",
        "404": "string",
        "500": "string"
      }
    }
  ]
}

### RULES
- RETURN ONLY VALID JSON. NO MARKDOWN.
- If authentication middleware is found, authRequired=true.
- Extract ALL Express routes.
- Infer params/body/query from destructuring.
- Skip nothing.

### CONTROLLER FILES:
${controllerData
  .map(c => `FILE: ${c.file}\n\n${c.content}`)
  .join("\n\n---\n\n")}
`.trim();

  try {
    if (res) {
      // Streaming Mode
      const stream = await streamWithHF(prompt);
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }
      
      res.write(`data: [DONE]\n\n`);
      res.end();
      return; 
    }

    // Legacy Mode
    let text = await generateWithHF(prompt);

    // Remove markdown fences if any
    text = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let json;
    try {
      // ✅ ROBUST FIX: extract JSON array only
      const start = text.indexOf("[");
      const end = text.lastIndexOf("]");

      if (start === -1 || end === -1) {
        throw new Error("No JSON array found in AI response");
      }

      const extractedJson = text.slice(start, end + 1);
      json = JSON.parse(extractedJson);

    } catch (err) {
      console.error("❌ Failed to parse API docs JSON:", text);
      throw {
        status: 500,
        message: "AI returned malformed JSON for API documentation."
      };
    }

    if (!Array.isArray(json)) {
      throw {
        status: 500,
        message: "AI did not return a JSON array for API documentation."
      };
    }

    return json;

  } catch (error) {
    console.error("🔥 AI service failed while generating API docs:", error);
    if (res) {
        res.write(`data: ${JSON.stringify({ error: "Failed to generate API Docs" })}\n\n`);
        res.end();
    }
    throw {
      status: 500,
      message: "AI service failed while generating API documentation."
    };
  }
}
