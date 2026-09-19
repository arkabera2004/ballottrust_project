import { BadRequestException } from '@nestjs/common';
import { ConfigValueType } from '@prisma/client';

import { parseConfigValue, validateConfigValue } from './config-value.util';

describe('validateConfigValue', () => {
  it.each([
    ['42', ConfigValueType.NUMBER],
    ['-3.5', ConfigValueType.NUMBER],
    ['true', ConfigValueType.BOOLEAN],
    ['FALSE', ConfigValueType.BOOLEAN],
    ['{"a":1}', ConfigValueType.JSON],
    ['[1,2]', ConfigValueType.JSON],
    ['anything at all', ConfigValueType.STRING],
  ])('accepts %s as %s', (value, type) => {
    expect(() => validateConfigValue(value, type)).not.toThrow();
  });

  it.each([
    ['abc', ConfigValueType.NUMBER],
    ['', ConfigValueType.NUMBER],
    ['   ', ConfigValueType.NUMBER],
    ['yes', ConfigValueType.BOOLEAN],
    ['1', ConfigValueType.BOOLEAN],
    ['{not json}', ConfigValueType.JSON],
  ])('rejects %s as %s', (value, type) => {
    expect(() => validateConfigValue(value, type)).toThrow(BadRequestException);
  });
});

describe('parseConfigValue', () => {
  it('parses each declared type back to its native value', () => {
    expect(parseConfigValue('42', ConfigValueType.NUMBER)).toBe(42);
    expect(parseConfigValue('true', ConfigValueType.BOOLEAN)).toBe(true);
    expect(parseConfigValue('False', ConfigValueType.BOOLEAN)).toBe(false);
    expect(parseConfigValue('{"a":1}', ConfigValueType.JSON)).toEqual({ a: 1 });
    expect(parseConfigValue('hello', ConfigValueType.STRING)).toBe('hello');
  });

  it('returns null rather than throwing on JSON edited directly in the database', () => {
    expect(parseConfigValue('{broken', ConfigValueType.JSON)).toBeNull();
  });
});
