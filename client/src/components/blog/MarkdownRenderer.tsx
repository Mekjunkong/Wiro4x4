/**
 * Custom Markdown-to-JSX renderer for blog post content.
 * Handles: headings, bold/italic, links, images, code blocks,
 * ordered/unordered lists, blockquotes, and horizontal rules.
 */
import type { ReactNode } from "react";
import { sanitizeUrl } from "@/lib/sanitizeUrl";

interface MarkdownRendererProps {
  content: string;
}

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  // Match: images, links, bold, italic, inline code
  const regex =
    /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1] !== undefined || match[2] !== undefined) {
      // Image: ![alt](src)
      parts.push(
        <img
          key={key++}
          src={sanitizeUrl(match[2])}
          alt={match[1] || ""}
          className="rounded-lg my-4 max-w-full"
          loading="lazy"
        />
      );
    } else if (match[3] !== undefined) {
      // Link: [text](url)
      parts.push(
        <a
          key={key++}
          href={sanitizeUrl(match[4])}
          className="text-primary hover:underline"
          target={match[4].startsWith("http") ? "_blank" : undefined}
          rel={match[4].startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {match[3]}
        </a>
      );
    } else if (match[5] !== undefined) {
      // Bold: **text**
      parts.push(<strong key={key++}>{match[5]}</strong>);
    } else if (match[6] !== undefined) {
      // Italic: *text*
      parts.push(<em key={key++}>{match[6]}</em>);
    } else if (match[7] !== undefined) {
      // Inline code: `code`
      parts.push(
        <code
          key={key++}
          className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
        >
          {match[7]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block: ```
    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <pre
          key={elements.length}
          className="bg-muted rounded-lg p-4 overflow-x-auto my-4"
        >
          <code className="text-sm font-mono">{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      elements.push(
        <hr key={elements.length} className="my-8 border-border" />
      );
      i++;
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={elements.length} className="text-lg font-bold mt-4 mb-2">
          {renderInline(line.slice(4))}
        </h4>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={elements.length} className="text-xl font-bold mt-6 mb-3">
          {renderInline(line.slice(3))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h2 key={elements.length} className="text-2xl font-bold mt-8 mb-4">
          {renderInline(line.slice(2))}
        </h2>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote
          key={elements.length}
          className="border border-primary/15 px-4 py-3 rounded-sm my-4 italic text-muted-foreground"
        >
          {quoteLines.map((ql, j) => (
            <p key={j} className="my-1">
              {renderInline(ql)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Unordered list (- or *)
    if (/^[-*•] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•] /.test(lines[i])) {
        items.push(lines[i].replace(/^[-*•] /, ""));
        i++;
      }
      elements.push(
        <ul key={elements.length} className="list-disc ml-6 my-4 space-y-1">
          {items.map((item, j) => (
            <li key={j} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list (1. 2. 3.)
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      elements.push(
        <ol key={elements.length} className="list-decimal ml-6 my-4 space-y-1">
          {items.map((item, j) => (
            <li key={j} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={elements.length} className="my-4 leading-relaxed">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="prose prose-lg max-w-none">{elements}</div>;
}
