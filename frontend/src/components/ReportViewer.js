"use client";

import { useState } from "react";

/**
 * Parses simple Markdown to JSX for inline rendering.
 * Handles: headings, tables, blockquotes, bold, horizontal rules, and paragraphs.
 */
function parseMarkdown(md) {
  if (!md) return null;

  const lines = md.split("\n");
  const elements = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Horizontal rule
    if (/^---+\s*$/.test(line.trim())) {
      elements.push(
        <hr key={key++} className="my-4 border-[var(--border-color)]" />
      );
      i++;
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={key++} className="text-sm font-bold text-[var(--text-primary)] mt-4 mb-2">
          {renderInline(line.slice(4))}
        </h4>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={key++} className="text-base font-bold text-[var(--text-primary)] mt-5 mb-2 flex items-center gap-2">
          {renderInline(line.slice(3))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h2 key={key++} className="text-lg font-bold text-[var(--text-primary)] mb-3 gradient-text">
          {renderInline(line.slice(2))}
        </h2>
      );
      i++;
      continue;
    }

    // Table: collect consecutive lines starting with |
    if (line.trim().startsWith("|")) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      elements.push(renderTable(tableLines, key++));
      continue;
    }

    // Blockquote
    if (line.trim().startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <blockquote key={key++} className="my-3 p-3 rounded-xl italic text-sm text-[var(--text-secondary)] leading-relaxed"
          style={{ background: "rgba(59,130,246,0.04)", borderLeft: "3px solid rgba(59,130,246,0.3)" }}>
          {quoteLines.join(" ")}
        </blockquote>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={key++} className="text-sm text-[var(--text-secondary)] mb-2 leading-relaxed">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return elements;
}

function renderInline(text) {
  // Simple bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-[var(--text-primary)]">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderTable(tableLines, key) {
  // Filter out separator lines like |---|---|
  const dataLines = tableLines.filter((l) => !/^\|[\s\-|]+\|$/.test(l));
  if (dataLines.length === 0) return null;

  const parseRow = (line) =>
    line.split("|").filter((c) => c.trim() !== "").map((c) => c.trim());

  const headerCells = parseRow(dataLines[0]);
  const bodyRows = dataLines.slice(1).map(parseRow);

  return (
    <div key={key} className="my-3 overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border-color)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "rgba(59,130,246,0.06)" }}>
            {headerCells.map((cell, ci) => (
              <th key={ci} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, ri) => (
            <tr key={ri} className="border-t border-[var(--border-color)]" style={{ background: ri % 2 === 0 ? "transparent" : "rgba(26,32,53,0.3)" }}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2.5 text-sm text-[var(--text-primary)]">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ReportViewer({ report }) {
  const [showRaw, setShowRaw] = useState(false);
  const hasContent = report.report_content && report.report_content.trim().length > 0;

  if (!hasContent) {
    return (
      <div className="glass-card-static p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📄</span>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">Final Report</h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">{report.report_summary}</p>
        <p className="text-xs text-[var(--text-muted)] mt-3 font-mono">Saved to: {report.report_path}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.2))" }}>
            📋
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Generated Clinical Report</h2>
            <p className="text-xs text-[var(--text-muted)]">Full triage report as generated by the Report Agent</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="btn-secondary text-xs flex items-center gap-1.5"
            id="toggle-report-view"
          >
            {showRaw ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Rendered
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                Markdown
              </>
            )}
          </button>
        </div>
      </div>

      {/* Report content */}
      <div className="glass-card-static overflow-hidden"
        style={{ boxShadow: "0 0 40px rgba(16,185,129,0.08)" }}>
        {/* Report header ribbon */}
        <div className="px-6 py-3 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))", borderBottom: "1px solid rgba(16,185,129,0.15)" }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-emerald)]" />
            <span className="text-xs font-semibold text-[var(--accent-emerald)]">GENERATED REPORT</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            {report.report_path.split(/[/\\]/).pop()}
          </span>
        </div>

        {/* Content area */}
        <div className="p-6">
          {showRaw ? (
            <pre className="text-xs text-[var(--text-secondary)] font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto p-4 rounded-xl"
              style={{ background: "rgba(17,24,39,0.6)", border: "1px solid var(--border-color)" }}>
              {report.report_content}
            </pre>
          ) : (
            <div className="report-rendered">
              {parseMarkdown(report.report_content)}
            </div>
          )}
        </div>
      </div>

      {/* Download hint */}
      <div className="flex items-center gap-2 p-3 rounded-xl"
        style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)" }}>
        <span className="text-sm">💾</span>
        <p className="text-xs text-[var(--text-muted)]">
          This report has been saved as a Markdown file at: <span className="font-mono text-[var(--accent-emerald)]">{report.report_path.split(/[/\\]/).pop()}</span>
        </p>
      </div>
    </div>
  );
}
