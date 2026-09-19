import { escapeCsvCell, parseCsv, toCsv } from './csv.util';

describe('parseCsv', () => {
  it('parses a simple document', () => {
    expect(parseCsv('email,notes\na@x.com,hello')).toEqual([
      ['email', 'notes'],
      ['a@x.com', 'hello'],
    ]);
  });

  it('keeps commas that appear inside quoted fields', () => {
    expect(parseCsv('name,city\n"Doe, Jane",Delhi')).toEqual([
      ['name', 'city'],
      ['Doe, Jane', 'Delhi'],
    ]);
  });

  it('unescapes doubled quotes inside a quoted field', () => {
    expect(parseCsv('note\n"She said ""hi"""')).toEqual([
      ['note'],
      ['She said "hi"'],
    ]);
  });

  it('preserves newlines inside quoted fields', () => {
    expect(parseCsv('address\n"Line 1\nLine 2"')).toEqual([
      ['address'],
      ['Line 1\nLine 2'],
    ]);
  });

  it('normalises CRLF line endings', () => {
    expect(parseCsv('a,b\r\n1,2\r\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('drops blank lines rather than emitting empty rows', () => {
    expect(parseCsv('a\n\n1\n')).toEqual([['a'], ['1']]);
  });

  it('returns no rows for an empty document', () => {
    expect(parseCsv('')).toEqual([]);
  });

  it('handles a trailing field with no newline', () => {
    expect(parseCsv('a,b\n1,2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });
});

describe('escapeCsvCell', () => {
  it('renders null and undefined as empty', () => {
    expect(escapeCsvCell(null)).toBe('');
    expect(escapeCsvCell(undefined)).toBe('');
  });

  it('leaves plain values unquoted', () => {
    expect(escapeCsvCell('plain')).toBe('plain');
    expect(escapeCsvCell(42)).toBe('42');
  });

  it('quotes values containing a delimiter, quote or newline', () => {
    expect(escapeCsvCell('a,b')).toBe('"a,b"');
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvCell('a\nb')).toBe('"a\nb"');
  });

  it('serialises dates as ISO strings', () => {
    expect(escapeCsvCell(new Date('2026-01-02T03:04:05.000Z'))).toBe(
      '2026-01-02T03:04:05.000Z',
    );
  });
});

describe('toCsv', () => {
  it('round-trips through parseCsv without losing structure', () => {
    const csv = toCsv(
      ['name', 'note'],
      [
        ['Doe, Jane', 'said "hi"'],
        ['Bob', 'line1\nline2'],
      ],
    );

    expect(parseCsv(csv)).toEqual([
      ['name', 'note'],
      ['Doe, Jane', 'said "hi"'],
      ['Bob', 'line1\nline2'],
    ]);
  });
});
