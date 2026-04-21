/**
 * Minimal CSV export helper. Quotes every field, escapes embedded quotes and
 * newlines, and triggers a browser download via a Blob. Client-side only.
 */

export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns?: Array<keyof T | { key: keyof T; label: string }>
): string {
  if (rows.length === 0) return "";
  const cols = (columns ?? (Object.keys(rows[0]) as Array<keyof T>)).map((c) =>
    typeof c === "object" && c !== null ? (c as { key: keyof T; label: string }) : { key: c as keyof T, label: String(c) }
  );
  const header = cols.map((c) => csvCell(c.label)).join(",");
  const lines = rows.map((r) => cols.map((c) => csvCell(r[c.key])).join(","));
  return [header, ...lines].join("\n");
}

function csvCell(value: unknown): string {
  if (value == null) return "";
  const s = Array.isArray(value) ? value.join("; ") : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
