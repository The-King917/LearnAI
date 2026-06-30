"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import type { Components } from "react-markdown";

const components: Components = {
  p: ({ children }) => <p>{children}</p>,
  strong: ({ children }) => <strong>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  hr: () => <hr />,
  h1: ({ children }) => <h1>{children}</h1>,
  h2: ({ children }) => <h2>{children}</h2>,
  h3: ({ children }) => <h3>{children}</h3>,
  ul: ({ children }) => <ul>{children}</ul>,
  ol: ({ children }) => <ol>{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  pre: ({ children }) => <pre>{children}</pre>,
  code: ({ children, className }) => (
    <code className={className}>{children}</code>
  ),
  table: ({ children }) => (
    <div className="table-wrap"><table>{children}</table></div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => <th>{children}</th>,
  td: ({ children }) => <td>{children}</td>,
};

interface MarkdownProps {
  children: string;
  streaming?: boolean;
}

// Escape bare currency dollar signs (e.g. $1.20) so remark-math doesn't
// treat them as LaTeX delimiters. Math expressions use \(...\) or $$...$$
// from the generator, so single $ followed by a digit is always currency.
function escapeCurrency(text: string): string {
  return text.replace(/\$(?=\d)/g, "\\$");
}

export default function Markdown({ children, streaming }: MarkdownProps) {
  return (
    <div className="prose-md">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={components}
      >
        {escapeCurrency(children)}
      </ReactMarkdown>
      {streaming && (
        <span
          className="inline-block w-[2px] h-[12px] bg-text-2 ml-0.5 align-middle"
          style={{ animation: "blink 1.1s step-end infinite" }}
        />
      )}
    </div>
  );
}
