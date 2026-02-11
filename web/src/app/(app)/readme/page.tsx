"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/authGuard";
import api from "@/lib/api";
import { motion } from "framer-motion";

export default function ReadmeGenerator() {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) router.push("/auth/login");
  }, []);

  const [repo, setRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [readme, setReadme] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!repo) return setError("Please enter a GitHub repo URL.");
    if (!localStorage.getItem("token")) return router.push("/auth/login");

    setError("");
    setLoading(true);
    setReadme("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/readme`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ repo }),
      });

      if (!response.ok) {
        throw new Error("Failed to start generation");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: DONE } = await reader.read();
        done = DONE;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          // Parse SSE format: "data: {...}"
          const lines = chunk.split("\n\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (dataStr === "[DONE]") {
                done = true; 
                break;
              }
              try {
                const { content } = JSON.parse(dataStr);
                if (content) {
                   setReadme((prev) => prev + content);
                }
              } catch (e) {
                // ignore incomplete chunks or keep-alive
              }
            }
          }
        }
      }

    } catch (err: any) {
      console.error(err);
      setError("Failed to generate README.");
    }

    setLoading(false);
  };

  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(readme);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-screen px-6 py-20 bg-white dark:bg-black text-black dark:text-white flex flex-col items-center">

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-4xl font-bold mb-10 text-center tracking-tight"
      >
        Generate README.md
      </motion.h1>

      {/* Input Box */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-xl p-8 rounded-2xl 
                   bg-white dark:bg-black 
                   border border-gray-200 dark:border-gray-800 shadow-sm"
      >
        <label className="text-lg font-semibold">GitHub Repository URL</label>
        <input
          className="w-full mt-3 p-4 rounded-xl 
                     bg-gray-50 dark:bg-gray-900 
                     border border-gray-200 dark:border-gray-800 
                     outline-none text-black dark:text-white focus:border-black dark:focus:border-white transition"
          placeholder="https://github.com/username/repo"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
        />

        {error && <p className="mt-3 text-red-600 text-sm font-medium">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-6 w-full text-center p-4 rounded-xl 
                     bg-black dark:bg-white text-white dark:text-black 
                     font-bold hover:opacity-80 
                     transition disabled:opacity-50 shadow-sm"
        >
          {loading ? "Generating…" : "Generate README"}
        </button>
      </motion.div>

      {/* Loading Animation */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-10 w-full max-w-3xl p-8 rounded-2xl
                     bg-white dark:bg-black 
                     border border-gray-200 dark:border-gray-800 shadow-sm"
        >
          <div className="animate-pulse w-full h-6 bg-gray-100 dark:bg-gray-900 rounded mb-3"></div>
          <div className="animate-pulse w-3/4 h-6 bg-gray-100 dark:bg-gray-900 rounded mb-3"></div>
          <div className="animate-pulse w-2/4 h-6 bg-gray-100 dark:bg-gray-900 rounded"></div>
        </motion.div>
      )}

      {/* README Preview */}
      {readme && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-10 w-full max-w-3xl p-8 rounded-2xl
                     bg-white dark:bg-black 
                     border border-gray-200 dark:border-gray-800 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-bold">README Preview</h2>
            <button
              onClick={copy}
              className="px-4 py-2 rounded-lg bg-black dark:bg-white 
                         text-white dark:text-black font-medium hover:opacity-80 
                         transition min-w-[140px]"
            >
              {copied ? "Copied!" : "Copy Markdown"}
            </button>
          </div>

          <pre className="whitespace-pre-wrap text-sm leading-7 text-gray-800 dark:text-gray-300 font-mono">
            {readme}
          </pre>
        </motion.div>
      )}
    </section>
  );
}
