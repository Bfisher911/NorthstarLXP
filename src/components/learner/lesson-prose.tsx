import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight Markdown-ish renderer for course lesson bodies. Supports:
 *   - `### Heading` (### H3, ## H2)
 *   - paragraphs (blank-line separated)
 *   - bullet lists (`- item` or `* item`)
 *   - numbered lists (`1. item`)
 *   - block quotes (`> …`)
 *   - inline **bold**
 *   - pipe-separated tables (`| col | col |`)
 *
 * Rendering stays inside a single `<div className="prose">` so styling is
 * consistent. No HTML injection — every token is rendered through React.
 */
export function LessonProse({ body, className }: { body: string; className?: string }) {
  const blocks = parseBlocks(body);
  return (
    <div
      className={cn(
        "space-y-3 text-sm leading-relaxed text-foreground [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:tracking-tight [&_strong]:font-semibold",
        className
      )}
    >
      {blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}
    </div>
  );
}

type Block =
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "quote"; text: string }
  | { kind: "table"; header: string[]; rows: string[][] };

function parseBlocks(body: string): Block[] {
  const lines = body.split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push({ kind: "h3", text: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ kind: "h2", text: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith("> ")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        buf.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ kind: "quote", text: buf.join(" ") });
      continue;
    }
    if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].replace(/^[-*] /, "").trim());
        i++;
      }
      blocks.push({ kind: "ul", items });
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, "").trim());
        i++;
      }
      blocks.push({ kind: "ol", items });
      continue;
    }
    if (line.trim().startsWith("|") && lines[i + 1] && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const header = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push({ kind: "table", header, rows });
      continue;
    }
    // paragraph — consume until blank line
    const buf: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !/^[-*] /.test(lines[i]) &&
      !/^\d+\. /.test(lines[i]) &&
      !lines[i].startsWith(">")
    ) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push({ kind: "p", text: buf.join(" ") });
  }
  return blocks;
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function Inline({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<strong key={key++}>{m[1]}</strong>);
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function Block({ block }: { block: Block }) {
  switch (block.kind) {
    case "h2":
      return <h2>{block.text}</h2>;
    case "h3":
      return <h3>{block.text}</h3>;
    case "p":
      return (
        <p>
          <Inline text={block.text} />
        </p>
      );
    case "ul":
      return (
        <ul className="list-disc space-y-1 pl-5">
          {block.items.map((it, i) => (
            <li key={i}>
              <Inline text={it} />
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal space-y-1 pl-5">
          {block.items.map((it, i) => (
            <li key={i}>
              <Inline text={it} />
            </li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote className="rounded-r-md border-l-4 border-primary/60 bg-primary/5 px-4 py-2 italic text-muted-foreground">
          <Inline text={block.text} />
        </blockquote>
      );
    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                {block.header.map((h, i) => (
                  <th key={i} className="px-3 py-2 font-semibold">
                    <Inline text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, ri) => (
                <tr key={ri} className="border-b last:border-0">
                  {r.map((c, ci) => (
                    <td key={ci} className="px-3 py-2 align-top">
                      <Inline text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}
