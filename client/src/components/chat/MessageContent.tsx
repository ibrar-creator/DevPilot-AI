
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";
import React, { useState } from "react";

interface MessageContentProps {
  content: string;
}

export default function MessageContent({
  content,
}: MessageContentProps) {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const copyCode = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);

      window.setTimeout(() => {
        setCopiedCode((current) =>
          current === text ? null : current
        );
      }, 2000);
    } catch {
      setCopiedCode(null);
    }
  };

  return (
    <div className="chat-message-content min-w-0 text-sm leading-7 text-slate-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre({ children }) {
            const codeElement = React.Children.toArray(children).find(
              (child) =>
                React.isValidElement<{ children?: React.ReactNode }>(child) &&
                child.type === "code"
            );

            const codeText = codeElement &&
              React.isValidElement<{ children?: React.ReactNode }>(codeElement)
                ? String(codeElement.props.children ?? "")
                : "";

            const isCopied = copiedCode === codeText;

            return (
              <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-[#080b12]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                  <span className="text-xs text-slate-500">
                    Code
                  </span>

                  <button
                    type="button"
                    onClick={() => copyCode(codeText)}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
                    aria-label="Copy code block"
                  >
                    {isCopied ? (
                      <Check size={13} />
                    ) : (
                      <Copy size={13} />
                    )}
                    {isCopied ? "Copied!" : "Copy code"}
                  </button>
                </div>

                <pre className="overflow-x-auto p-4 text-[13px] leading-6">
                  {children}
                </pre>
              </div>
            );
          },

          code({ children, className, ...props }) {
            const isBlock = Boolean(className);

            return (
              <code
                {...props}
                className={
                  isBlock
                    ? className
                    : "rounded bg-white/10 px-1.5 py-0.5 text-blue-300"
                }
              >
                {children}
              </code>
            );
          },

          p({ children }) {
            return <p className="mb-3 last:mb-0">{children}</p>;
          },

          ul({ children }) {
            return (
              <ul className="mb-3 list-disc space-y-1 pl-6">
                {children}
              </ul>
            );
          },

          ol({ children }) {
            return (
              <ol className="mb-3 list-decimal space-y-1 pl-6">
                {children}
              </ol>
            );
          },

          h1({ children }) {
            return (
              <h1 className="mb-3 mt-5 text-xl font-bold text-white">
                {children}
              </h1>
            );
          },

          h2({ children }) {
            return (
              <h2 className="mb-3 mt-5 text-lg font-bold text-white">
                {children}
              </h2>
            );
          },

          h3({ children }) {
            return (
              <h3 className="mb-2 mt-4 text-base font-semibold text-white">
                {children}
              </h3>
            );
          },

          blockquote({ children }) {
            return (
              <blockquote className="my-3 border-l-2 border-blue-400 pl-4 text-slate-400">
                {children}
              </blockquote>
            );
          },

          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  {children}
                </table>
              </div>
            );
          },

          th({ children }) {
            return (
              <th className="border border-white/10 bg-white/5 px-3 py-2 font-semibold text-white">
                {children}
              </th>
            );
          },

          td({ children }) {
            return (
              <td className="border border-white/10 px-3 py-2">
                {children}
              </td>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>

      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={() => copyText(content)}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-white/5 hover:text-white"
          aria-label="Copy full message"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy response"}
        </button>
      </div>
    </div>
  );
}
