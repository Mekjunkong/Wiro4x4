/**
 * CSV Export Utility
 *
 * Generates and downloads CSV files with:
 * - BOM prefix for Excel UTF-8 compatibility (Hebrew text)
 * - Proper escaping of commas, quotes, and newlines
 * - Blob + URL.createObjectURL download trick
 */

/** Escape a cell value for CSV (handles commas, quotes, newlines) */
function escapeCell(value: unknown): string {
  if (value == null) return '""';
  const raw = value instanceof Date ? value.toISOString() : String(value);
  // Neutralize values Excel/Sheets can interpret as formulas while preserving
  // the visible text. Leading whitespace is ignored for the safety check.
  const str = /^[=+\-@\t\r]/.test(raw.trimStart()) ? `'${raw}` : raw;
  // Always wrap in quotes; escape internal quotes by doubling them
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Generate and trigger download of a CSV file.
 *
 * @param filename  - Download filename (e.g. "wiro-bookings-2026-03-21.csv")
 * @param headers   - Column header labels (display names)
 * @param rows      - Array of arrays, each inner array is one row of cell values
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: unknown[][]
): void {
  if (rows.length === 0) return;

  const lines: string[] = [
    headers.map(escapeCell).join(","),
    ...rows.map(row => row.map(escapeCell).join(",")),
  ];

  const csvContent = lines.join("\n");

  // BOM (Byte Order Mark) so Excel opens UTF-8 correctly (important for Hebrew)
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Legacy helper — accepts an array of objects and auto-derives headers from keys.
 * Kept for backward compatibility.
 */
export function downloadCSV(
  data: Record<string, unknown>[],
  filename: string
): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => row[h]));
  exportToCsv(filename, headers, rows);
}

/** Return today's date as YYYY-MM-DD for filenames */
export function todayStamp(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Format a date value to YYYY-MM-DD string, or empty string if null */
export function fmtDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
