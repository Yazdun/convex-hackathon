"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface MarkdownFormatterProps {
  text: string;
  className?: string;
}

export function MarkdownFormatter({
  text,
  className = "",
}: MarkdownFormatterProps) {
  return (
    <div className={cn(`text-foreground w-full max-w-full`, className)}>
      <ReactMarkdown
        components={{
          // Links with underline styling
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-foreground underline hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          // Code blocks - minimal black and white styling
          pre: ({ children }) => (
            <pre className="text-foreground rounded-md border my-2 font-mono text-sm overflow-hidden">
              <div className="flex">
                <ScrollArea type="always" className="w-1 flex-1">
                  <div className="flex">{children}</div>
                  <ScrollBar orientation="horizontal" className="w-full" />
                </ScrollArea>
              </div>
            </pre>
          ),
          // Inline code
          code: ({ children }) => (
            <code className="text-foreground px-1 py-0.5 rounded font-mono text-sm">
              {children}
            </code>
          ),
          // Bold text
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          // Italic text
          em: ({ children }) => <em className="italic">{children}</em>,
          // Bullet points
          ul: ({ children }) => <ul className="my-2">{children}</ul>,
          li: ({ children }) => (
            <li className="flex items-start gap-2 my-1">
              <span className="text-foreground mt-1">•</span>
              <span>{children}</span>
            </li>
          ),
          // Remove default paragraph margins for inline formatting
          p: ({ children }) => <div className="my-1">{children}</div>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
