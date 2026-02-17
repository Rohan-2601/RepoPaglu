import { generateWithHF, streamWithHF } from "../llm/groq.js";

/**
 * Collect content from project files
 */
export function collectProjectFiles(files) {
  const RELEVANT_FILES = new Set([
    "package.json",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "dockerfile",
    "docker-compose.yml",
    "docker-compose.yaml",
    "README.md",
    "tsconfig.json",
    "jsconfig.json",
    "next.config.js",
    "vite.config.js", 
    "webpack.config.js",
    "vercel.json",
    "netlify.toml",
    ".env.example",
    "go.mod",
    "cargo.toml",
    "gemfile",
    "requirements.txt",
    "pom.xml",
    "build.gradle"
  ]);

  return files
    .filter(f => {
      const lowerMap = f.relative.toLowerCase();
      const fileName = lowerMap.split(/[\\/]/).pop();
      
      // 1. Include exact config matches
      if (RELEVANT_FILES.has(fileName)) return true;

      // 2. Include high-level entry points
      if (fileName.match(/^(app|server|index|main)\.(js|ts|py|go|java)$/)) return true;

      return false;
    })
    .map(f => ({
      file: f.relative,
      content: f.content
    }));
}

export async function generateTechStackReport(projectFiles, res) {
  const prompt = `
You are a senior software architect.

Analyze the following project files and return a STRICT JSON OBJECT describing the project's tech stack.

### OUTPUT FORMAT (STRICT JSON ONLY):
{
  "languages": [],
  "frameworks": [],
  "packageManager": "",
  "architecture": "",
  "libraries": [],
  "database": "",
  "externalServices": [],
  "auth": "",
  "fileUpload": "",
  "routing": "",
  "errorHandling": "",
  "logging": "",
  "envVars": [],
  "deployment": "",
  "strengths": [],
  "weaknesses": [],
  "recommendations": []
}

### IMPORTANT RULES:
- RETURN STRICT JSON ONLY. NO MARKDOWN. NO BACKTICKS.
- If something is unknown, return an empty array or empty string.
- Infer technologies from filenames, imports, and patterns.
- Identify Express patterns, multer, cloudinary, mongoose, JWT, bcrypt, etc.
- Do NOT add explanations outside JSON.
- **CRITICAL:** You MUST provide at least 3 distinct items for "strengths", "weaknesses", and "recommendations".
- For "strengths", focus on architecture, modernization, and best practices.
- For "weaknesses", look for security risks, scalability issues, or outdated patterns.
- For "recommendations", suggest specific libraries, architectural changes, or performance improvements.

### PROJECT FILES:
${projectFiles
  .map(
    p =>
      `FILE: ${p.file}\nSUMMARY:\n${p.summary || "No summary available"}`
  )
  .join("\n\n-----\n\n")}
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

    // Clean accidental fences
    text = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error(" AI returned invalid JSON for tech stack:", text);
      throw {
        status: 500,
        message: "AI returned invalid JSON for tech stack.",
      };
    }

    return data;

  } catch (error) {
    console.error("🔥 AI service failed while generating tech stack:", error);
    if (res) {
        res.write(`data: ${JSON.stringify({ error: "Failed to generate tech stack" })}\n\n`);
        res.end();
    }
    throw {
      status: 500,
      message: "AI service failed while generating tech stack.",
    };
  }
}
