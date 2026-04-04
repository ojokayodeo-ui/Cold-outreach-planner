"use client";
import { useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className="text-xs px-2 py-1 rounded border border-[#2a2a45] text-[#6060a0] hover:text-[#e8e8f2] hover:border-[#4f8ef7] transition-colors"
    >
      {copied ? "✓ Copied" : label}
    </button>
  );
}

export function Tag({ children, color = "blue" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    green: "bg-green-500/10 text-green-400 border-green-500/30",
    red: "bg-red-500/10 text-red-400 border-red-500/30",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    gray: "bg-white/5 text-[#6060a0] border-white/10",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors[color] ?? colors.gray}`}>
      {children}
    </span>
  );
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-[#e8e8f2]">{title}</h2>
      {subtitle && <p className="text-sm text-[#6060a0] mt-1">{subtitle}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#0f0f1a] border border-[#1e1e35] rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}

export function Loader({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-8 h-8 border-2 border-[#4f8ef7] border-t-transparent rounded-full animate-spin" />
      <p className="text-[#6060a0] text-sm">{text}</p>
      <div className="w-64 space-y-2 mt-4">
        {[100, 80, 90].map((w, i) => (
          <div key={i} className="skeleton h-3 rounded" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
      <p className="text-red-400 text-sm font-medium">Error: {message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 text-xs text-red-400 underline hover:no-underline">
          Try again
        </button>
      )}
    </div>
  );
}

export function PrimaryButton({
  children, onClick, disabled = false, className = "",
}: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-xl bg-[#4f8ef7] text-white font-medium text-sm hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all ${className}`}
    >
      {children}
    </button>
  );
}
