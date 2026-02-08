/**
 * Simple Markdown-to-JSX renderer for blog post content.
 * Handles headings (#, ##, ###), bold (**...**), list items (-, bullet),
 * and regular paragraphs.
 */

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-lg max-w-none">
      {content.split('\n').map((paragraph: string, idx: number) => {
        if (paragraph.startsWith('# ')) {
          return <h1 key={idx} className="text-3xl font-bold mt-8 mb-4">{paragraph.slice(2)}</h1>;
        } else if (paragraph.startsWith('## ')) {
          return <h2 key={idx} className="text-2xl font-bold mt-6 mb-3">{paragraph.slice(3)}</h2>;
        } else if (paragraph.startsWith('### ')) {
          return <h3 key={idx} className="text-xl font-bold mt-4 mb-2">{paragraph.slice(4)}</h3>;
        } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
          return <p key={idx} className="font-bold my-2">{paragraph.slice(2, -2)}</p>;
        } else if (paragraph.startsWith('- ') || paragraph.startsWith('\u2022 ')) {
          return <li key={idx} className="ml-6 my-1">{paragraph.slice(2)}</li>;
        } else if (paragraph.trim()) {
          return <p key={idx} className="my-4 leading-relaxed">{paragraph}</p>;
        }
        return null;
      })}
    </div>
  );
}
