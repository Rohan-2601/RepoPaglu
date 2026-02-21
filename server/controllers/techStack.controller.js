import fs from "fs/promises";
import path from "path";
import { cloneRepo, cleanupTemp } from "../services/repo.service.js";
import { extractAndFilterFiles } from "../services/file.service.js";
import { collectProjectFiles, generateTechStackReport } from "../services/techStack.service.js";

export const techStackController = async (req, res) => {
  let repoPath = null;

  try {
    const { repo } = req.body;

    if (!repo) {
      return res.status(400).json({
        success: false,
        message: "Missing repo URL",
      });
    }

    // Clone repo
    repoPath = await cloneRepo(repo);

    // Extract project files
    const files = await extractAndFilterFiles(repoPath);

    if (!files.length) {
      return res.status(400).json({
        success: false,
        message: "No files found to analyze.",
      });
    }

    // Prepare file data
    let packageJsonContent = "";
    try {
      const pkgPath = path.join(repoPath, "package.json");
      packageJsonContent = await fs.readFile(pkgPath, "utf-8");
    } catch {
      packageJsonContent = "";
    }

    const projectFiles = collectProjectFiles(files);
    projectFiles.push({
      file: "package.json",
      summary: packageJsonContent
    });

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Generate tech stack analysis (Streamed)
    await generateTechStackReport(projectFiles, res);
    
    // Note: cleanup happens in finally block

  } catch (err) {
    console.error("Tech Stack Controller Error:", err);
    if (!res.headersSent) {
      const status = err.status || 500;
      return res.status(status).json({
        success: false,
        message: err.message || "Failed to generate tech stack report."
      });
    } else {
        res.end();
    }

  } finally {
    if (repoPath) {
      await cleanupTemp(repoPath).catch(() => {
        console.error("Cleanup failed after tech stack analysis.");
      });
    }
  }
};

