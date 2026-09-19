/**
 * Minimal RFC 4180 CSV handling.
 *
 * A dependency would be overkill for two call sites, but naive
 * `split(',')` is wrong the moment a voter's name or address contains a
 * comma, so quoting is handled properly in both directions.
 */

/** Parses one CSV document into rows of raw cell strings. */
export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];

  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  // Normalise line endings so CRLF files from Excel parse identically.
  const text = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          // Escaped quote inside a quoted field.
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }

      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  // Flush the trailing cell/row unless the file ended on a clean newline.
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

/**
 * Values a CSV cell can hold. Deliberately excludes arbitrary objects:
 * they would stringify to "[object Object]" and silently corrupt an
 * export rather than failing at the call site.
 */
export type CsvCell = string | number | boolean | Date | null | undefined;

/** Quotes a single cell if it contains a delimiter, quote or newline. */
export function escapeCsvCell(value: CsvCell): string {
  if (value === null || value === undefined) {
    return '';
  }

  const text = value instanceof Date ? value.toISOString() : String(value);

  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

/** Serialises a header plus rows into a CSV document. */
export function toCsv(headers: string[], rows: CsvCell[][]): string {
  const lines = [headers.map(escapeCsvCell).join(',')];

  for (const row of rows) {
    lines.push(row.map(escapeCsvCell).join(','));
  }

  return lines.join('\n');
}
