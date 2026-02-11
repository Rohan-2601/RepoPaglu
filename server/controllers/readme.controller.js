import { cloneRepo, cleanupTemp } from "../services/repo.service.js";
import { extractAndFilterFiles, generateFolderTree } from "../services/file.service.js";
import { buildDependencyGraph } from "../services/dependency.service.js";
import { generateSummary } from "../services/summary.service.js";
import { generateReadmeContent } from "../services/readme.service.js";

export const readmeController = async (req, res) => {
  let repoPath = null;

  try {
    const { repo } = req.body;

    if (!repo) {
      return res.status(400).json({
        success: false,
        message: "Missing 'repo' field."
      });
    }

    // Clone repository
    repoPath = await cloneRepo(repo);

    // Extract project files
    const files = await extractAndFilterFiles(repoPath);

    // Build dependency graph
    // Build dependency graph (keep this for now, fast enough)
    const dependencyGraph = buildDependencyGraph(files, repoPath);

    // --- AUTO-EXTRACT CONTEXT (No LLM) ---
    console.log(" Extracting metadata...");

    // 1. Package.json
    // We need to re-read package.json because extractAndFilterFiles might filter it out (it filters for js/ts)
    // Let's try to find it in the raw repo if possible, or assume it's in the files list if we adjust filter
    // For now, let's assume we might need to read it manually if not in `files`
    let packageJson = "{}";
    try {
        const fs = await import("fs/promises");
        const path = await import("path");
        const pkgPath = path.join(repoPath, "package.json");
        packageJson = await fs.readFile(pkgPath, "utf-8");
    } catch (e) {
        console.warn("No package.json found");
    }

    // 2. Folder Tree
    const fileTree = generateFolderTree(files);

    // 3. Key Modules (Top-level src folders)
    const keyModules = files
        .map(f => f.relative.split(/[\\/]/)[0])
        .filter((v, i, a) => a.indexOf(v) === i) // unique
        .filter(v => !v.includes(".")) // exclude files
        .slice(0, 10); // cap at 10

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Generate README content (Streamed)
    const context = {
        packageJson,
        fileTree,
        keyModules,
        dependencyGraph 
    };

    await generateReadmeContent(context, res);

    // Note: cleanup happens in finally block
    
  } catch (err) {
    console.error("README Generation Error:", err);
    
    // If headers haven't been sent, send JSON error
    if (!res.headersSent) {
      const status = err.status || 500;
      return res.status(status).json({
        success: false,
        message: err.message || "Failed to generate README."
      });
    } else {
        // If stream started, we already sent an error event in service
        res.end();
    }

  } finally {
    if (repoPath) {
      await cleanupTemp(repoPath).catch(() => {
        console.error("Cleanup failed during README generation.");
      });
    }
  }
};
