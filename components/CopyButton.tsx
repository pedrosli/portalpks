"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-md border border-violet-300 px-4 py-2 text-sm font-medium text-violet-800 hover:bg-violet-50"
    >
      {copied ? "Copiado!" : "Copiar informações"}
    </button>
  );
}
