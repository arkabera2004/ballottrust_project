import { BadRequestException } from '@nestjs/common';
import { ConfigValueType } from '@prisma/client';

export type ConfigValue = string | number | boolean | null | object;

/** Placeholder returned in place of a secret value. */
export const REDACTED = '********';

/**
 * Validates that a raw string is a well-formed instance of its declared
 * type. Done on write so a malformed value can never be stored and then
 * blow up at read time, far from the change that caused it.
 */
export function validateConfigValue(
  value: string,
  valueType: ConfigValueType,
): void {
  switch (valueType) {
    case ConfigValueType.NUMBER:
      if (value.trim() === '' || Number.isNaN(Number(value))) {
        throw new BadRequestException(
          `Value "${value}" is not a valid NUMBER.`,
        );
      }
      return;

    case ConfigValueType.BOOLEAN:
      if (!['true', 'false'].includes(value.trim().toLowerCase())) {
        throw new BadRequestException(
          `Value "${value}" is not a valid BOOLEAN; expected "true" or "false".`,
        );
      }
      return;

    case ConfigValueType.JSON:
      try {
        JSON.parse(value);
      } catch {
        throw new BadRequestException(`Value is not valid JSON.`);
      }
      return;

    case ConfigValueType.STRING:
    default:
      return;
  }
}

/** Converts a stored string back into its declared type. */
export function parseConfigValue(
  value: string,
  valueType: ConfigValueType,
): ConfigValue {
  switch (valueType) {
    case ConfigValueType.NUMBER:
      return Number(value);

    case ConfigValueType.BOOLEAN:
      return value.trim().toLowerCase() === 'true';

    case ConfigValueType.JSON:
      try {
        return JSON.parse(value) as object;
      } catch {
        // Unreachable for values written through this module, but a row
        // edited directly in the database must not crash a read.
        return null;
      }

    case ConfigValueType.STRING:
    default:
      return value;
  }
}
