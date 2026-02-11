import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { rm } from "fs/promises";

const CACHE_DIR = path.join(os.tmpdir(), "repo-paglu-cache");

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}


export async function cloneRepo(repoUrl) {
  console.log(" Accessing repo:", repoUrl);

  // Generate a unique hash for the repo URL to use as folder name
  const repoHash = crypto.createHash("md5").update(repoUrl).digest("hex");
  const repoDir = path.join(CACHE_DIR, repoHash);

  const git = simpleGit();

  try {
    if (fs.existsSync(repoDir)) {
      console.log("Cache hit! Pulling latest changes...");
      // If repo exists, pull latest changes to keep it fresh
      await git.cwd(repoDir).pull();
    } else {
      console.log("Cache miss! Cloning new repo...");
      // Shallow clone for speed
      await git.clone(repoUrl, repoDir, ["--depth", "1"]);
    }

    return repoDir;
  } catch (err) {
    console.error(" Repo access failed:", err.message);

    // Clean corrupt folder if operation fails
    await rm(repoDir, { recursive: true, force: true }).catch(() => {});

    throw new Error("Failed to clone or access repository.");
  }
}

/**
 * Cleanup old cache directories (Simple LRU - 1 Hour TTL)
 * Can be called periodically or on new clones.
 */
async function cleanOldCache() {
  const MAX_AGE_MS = 60 * 60 * 1000; // 1 Hour
  
  try {
    const files = await fs.promises.readdir(CACHE_DIR);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(CACHE_DIR, file);
      const stats = await fs.promises.stat(filePath);

      if (now - stats.mtimeMs > MAX_AGE_MS) {
        console.log("Cleaning expired cache:", file);
        await rm(filePath, { recursive: true, force: true }).catch(() => {});
      }
    }
  } catch (err) {
    console.error(" Cache cleanup error:", err.message);
  }
}

/**
 * Cleanup is now OPTIONAL or scheduled
 * We trigger a background cleanup of old types on every clone.
 */
export async function cleanupTemp(dir) {
  // Trigger background cleanup (don't await)
  cleanOldCache();
}


