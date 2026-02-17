import { cloneRepo, cleanupTemp } from "../services/repo.service.js";
import { extractAndFilterFiles } from "../services/file.service.js";
import { extractControllerInfo, generateApiDocs } from "../services/apiDocs.service.js";

export const apiDocsController = async (req, res) => {
  let repoPath = null;

  try {
    const { repo } = req.body;
    if (!repo) {
      return res.status(400).json({
        success: false,
        message: "Missing repo URL",
      });
    }

    // Clone repository
    repoPath = await cloneRepo(repo);
    console.log(`✅ Repo logged: ${repoPath}`);

    // Extract files
    const files = await extractAndFilterFiles(repoPath);
    console.log(`✅ Extracted ${files.length} files.`);

    // Extract controllers
    console.log("🔍 Extracting controllers...");
    const controllers = extractControllerInfo(files);
    console.log(`✅ Found ${controllers.length} controllers.`);

    if (!controllers.length) {
      return res.status(400).json({
        success: false,
        message: "No controllers found to document.",
      });
    }

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Generate API documentation (Streamed)
    console.log("🚀 Starting API Docs Stream...");
    await generateApiDocs(controllers, res);
    console.log("✅ API Docs Stream finished.");

    // Note: cleanup happens in finally block

  } catch (err) {
    console.error("API Docs Error:", err);
    if (!res.headersSent) {
      const status = err.status || 500;
      return res.status(status).json({
        success: false,
        message: err.message || "Failed to generate API docs."
      });
    } else {
        res.end();
    }

  } finally {
    if (repoPath) {
      await cleanupTemp(repoPath).catch(() => {
        console.error("Cleanup failed.");
      });
    }
  }
};

