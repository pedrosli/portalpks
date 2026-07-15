"use client";

export default function SuggestedDescription({ text }: { text: string }) {
  const lines = text.split("\n").length;

  return (
    <textarea
      readOnly
      value={text}
      rows={Math.min(Math.max(lines, 8), 20)}
      onFocus={(e) => e.currentTarget.select()}
      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm text-neutral-700 outline-none focus:border-violet-400"
    />
  );
}
