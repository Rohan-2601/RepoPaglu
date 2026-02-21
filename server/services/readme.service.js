import { generateWithHF, streamWithHF } from "../llm/groq.js";

/**
 * Generate README.md content using Hugging Face (Streamed)
 */
export async function generateReadmeContent(context, res) {
  const prompt = `
You are generating a README based ONLY on provided structured data.

You MUST NOT invent anything.
If information is missing, state "Not specified".

### PROJECT NAME:
${context.projectName}

### DESCRIPTION:
${context.description}

### SCRIPTS:
${context.scripts.join(", ") || "None"}

### DEPENDENCIES:
${context.dependencies.join(", ") || "None"}

### PROJECT STRUCTURE:
${context.fileTree}

### RULES:
- Do NOT assume technologies.
- Do NOT invent features.
- Only describe what is explicitly listed above.
- Keep it concise.
- Do not use marketing language.

Generate the README now.
`;

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
      
    } else {
      // Legacy Block Mode (for internal use)
      let content = await generateWithHF(prompt);
      return content.replace(/```markdown/gi, "").replace(/```/g, "").trim();
    }

  } catch (error) {
    console.error(" AI README Generator Error:", error);
    if (res) {
       res.write(`data: ${JSON.stringify({ error: "Failed to generate README" })}\n\n`);
       res.end();
    }
    throw error;
  }
}
