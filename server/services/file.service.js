import fs from "fs";
import path from "path";

/**
 * Generate a visual folder tree string (max depth 2)
 */
export function generateFolderTree(files) {
  const tree = {};
  
  for (const file of files) {
    if (!file.relative) continue;
    
    // Normalize path separators
    const parts = file.relative.replace(/\\/g, "/").split("/");
    let current = tree;
    
    // Limit depth to 2 levels for the visual tree
    const depth = Math.min(parts.length, 3); 
    
    for (let i = 0; i < depth; i++) {
        const part = parts[i];
        if (!current[part]) {
            current[part] = i === depth - 1 && parts.length === depth ? null : {};
        }
        current = current[part];
    }
  }

  function buildString(node, prefix = "") {
    let lines = [];
    const keys = Object.keys(node || {}).sort();
    
    keys.forEach((key, index) => {
        const isLast = index === keys.length - 1;
        const marker = isLast ? "└── " : "├── ";
        lines.push(`${prefix}${marker}${key}`);
        
        if (node[key]) {
            const childPrefix = prefix + (isLast ? "    " : "│   ");
            lines.push(...buildString(node[key], childPrefix));
        }
    });
    
    return lines;
  }

  return buildString(tree).join("\n");
}

const MAX_FILE_SIZE = 100 * 1024; // 100 KB
const MIN_LINES = 20;

const IGNORED_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  ".next",
  "coverage",
  ".git",
  "public",
  "assets",
  "vendor",
  "migrations",
]);

const IGNORED_FILES = new Set([
  "vite.config.js",
  "vite.config.ts",
  "next.config.js",
  "eslint.config.js",
  "eslint.config.ts",
  "jest.config.js",
  "jest.config.ts",
  "tailwind.config.js",
  "tailwind.config.ts",
  "postcss.config.js",
  "postcss.config.ts",
]);

export async function extractAndFilterFiles(repoPath) {
  console.log("📄 Extracting & filtering files from:", repoPath);

  const result = [];

  const walk = (dir, depth = 0) => {
    if (depth > 20) return; // Prevent stack overflow

    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
        console.warn(`Skipping dir ${dir}: ${e.message}`);
        return;
    }

    for (const entry of entries) {
      const full = path.join(dir, entry.name);

      if (entry.isSymbolicLink()) continue; // Skip symlinks

      if (entry.isDirectory()) {
        // ignore exact folder names only, not substrings
        if (IGNORED_DIRS.has(entry.name)) continue;
        walk(full, depth + 1);
        continue;
      }

      // ignore exact filenames only
      if (IGNORED_FILES.has(entry.name)) continue;

      // Only process JS/TS/JSX/TSX
      if (!/\.(js|ts|jsx|tsx)$/.test(entry.name)) continue;

      const stat = fs.statSync(full);
      if (stat.size > MAX_FILE_SIZE) continue;

      const content = fs.readFileSync(full, "utf8");
      const lineCount = content.split(/\r?\n/).length;
      if (lineCount < MIN_LINES) continue;

      // Build clean relative path
      const relative = full
        .replace(repoPath, "")
        .replace(/\\/g, "/")
        .replace(/^\//, "");

      result.push({
        fullPath: full,
        relative,
        content,
      });
    }
  };

  walk(repoPath);
  return result;
}



