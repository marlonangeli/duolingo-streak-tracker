"use client";

import { useState } from "react";

type MarkdownSnippetProps = {
  snippet: string;
};

const MarkdownSnippet = ({ snippet }: MarkdownSnippetProps) => {
  const [copied, setCopied] = useState(false);

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-slate-600/40 bg-slate-900/60 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">Markdown snippet</p>
        <button
          type="button"
          onClick={copySnippet}
          className="duo-link duo-interactive px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
          aria-live="polite"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="overflow-x-auto text-xs text-slate-200 sm:text-sm">{snippet}</pre>
    </div>
  );
};

export default MarkdownSnippet;
