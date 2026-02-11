import { generateWithHF, streamWithHF } from "../llm/groq.js";

/**
 * Generate README.md content using Hugging Face (Streamed)
 */
export async function generateReadmeContent(context, res) {
  const { packageJson, fileTree, keyModules } = context;

  const prompt = `
Write a clean, professional README.md for this project.

### Project Metadata
**Package.json**: 
\`\`\`json
${packageJson.slice(0, 5000)}
\`\`\`

**Project Structure**:
\`\`\`text
${fileTree}
\`\`\`

**Key Modules/Folders**:
${keyModules.join(", ")}

### Guidelines:
- Use the package.json to identify Name, Description, Scripts, and Dependencies.
- Use the Folder Tree to explain the project structure.
- Write a professional "Features" section based on dependencies (e.g. Express = Web Server, React = UI).
- Include standard sections: Install, Usage, API (if applicable), Tech Stack.
- Keep it concise.

Begin now:
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
      
    } else {
      // Legacy Block Mode (for internal use)
      let content = await generateWithHF(prompt);
      return content.replace(/```markdown/gi, "").replace(/```/g, "").trim();
    }

  } catch (error) {
    console.error("🔥 AI README Generator Error:", error);
    if (res) {
       res.write(`data: ${JSON.stringify({ error: "Failed to generate README" })}\n\n`);
       res.end();
    }
    throw error;
  }
}
