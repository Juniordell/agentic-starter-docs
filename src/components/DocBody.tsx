"use client";

import { useState } from "react";
import type { DocContent } from "@/lib/content";

function renderBody(body: string) {
  const lines = body.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 mb-4 ml-1">
        {listItems.map((item, i) => (
          <li key={i} className="text-[var(--text-muted)] text-sm leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: renderInline(item.replace(/^-\s*/, "")) }} />
          </li>
        ))}
      </ul>
    );
    listItems = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("- ")) {
      listItems.push(line);
    } else {
      flushList();
      if (line.trim()) {
        elements.push(
          <p
            key={`p-${i}`}
            className="text-[var(--text-muted)] text-sm leading-relaxed mb-3"
            dangerouslySetInnerHTML={{ __html: renderInline(line) }}
          />
        );
      }
    }
  }
  flushList();
  return elements;
}

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[var(--text)]">$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function CodeBlock({ lang, content }: { lang: string; content: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border)] my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <span className="text-xs text-[var(--text-muted)] font-mono">{lang}</span>
        <button
          onClick={copy}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto bg-[var(--surface)] !border-0 !rounded-none">
        <code className="text-sm text-[var(--text-muted)] font-mono">{content}</code>
      </pre>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-4 rounded-lg border border-[var(--border)]">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                <span dangerouslySetInnerHTML={{ __html: renderInline(h) }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-secondary)]/40 transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2.5 text-[var(--text-muted)]">
                  <span dangerouslySetInnerHTML={{ __html: renderInline(cell) }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Callout({ type, text }: { type: "info" | "warning" | "tip"; text: string }) {
  const styles = {
    info: { bar: "bg-[var(--info)]", wrap: "bg-[var(--bg-secondary)] border-[var(--border)]", text: "text-[var(--text-muted)]", label: "text-[var(--info)]" },
    warning: { bar: "bg-[var(--warning)]", wrap: "bg-[var(--bg-secondary)] border-[var(--border)]", text: "text-[var(--text-muted)]", label: "text-[var(--warning)]" },
    tip: { bar: "bg-[var(--accent)]", wrap: "bg-[var(--accent-dim)] border-[var(--accent)]/20", text: "text-[var(--text-muted)]", label: "text-[var(--accent)]" },
  };
  const labels = { info: "Info", warning: "Warning", tip: "Tip" };
  const s = styles[type];
  return (
    <div className={`my-4 flex rounded-lg border overflow-hidden ${s.wrap}`}>
      <div className={`w-1 flex-shrink-0 ${s.bar}`} />
      <div className="px-4 py-3">
        <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${s.label}`}>{labels[type]}</p>
        <p className={`text-sm leading-relaxed ${s.text}`} dangerouslySetInnerHTML={{ __html: renderInline(text) }} />
      </div>
    </div>
  );
}

export function DocBody({ content }: { content: DocContent }) {
  return (
    <article>
      <div className="mb-10 pb-8 border-b border-[var(--border)]">
        <h1 className="text-4xl font-bold text-[var(--text)] tracking-tight mb-3">{content.title}</h1>
        {content.description && (
          <p className="text-lg text-[var(--text-muted)] leading-relaxed">{content.description}</p>
        )}
      </div>

      <div className="space-y-6">
        {content.sections.map((section, i) => (
          <section key={i}>
            {section.heading && (
              <h2 className="text-xl font-semibold text-[var(--text)] mb-3 flex items-center gap-3 mt-10 tracking-tight">
                <span className="w-1 h-5 rounded-full bg-[var(--accent)] flex-shrink-0" />
                {section.heading}
              </h2>
            )}
            {section.callout && <Callout {...section.callout} />}
            {section.body && renderBody(section.body)}
            {section.code && <CodeBlock lang={section.code.lang} content={section.code.content} />}
            {section.table && <Table headers={section.table.headers} rows={section.table.rows} />}
          </section>
        ))}
      </div>
    </article>
  );
}
