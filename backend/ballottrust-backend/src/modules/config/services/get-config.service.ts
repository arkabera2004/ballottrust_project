import { Injectable, NotFoundException } from '@nestjs/common';

import { SystemConfigRepository } from '../repository/system-config.repository';
import { parseConfigValue, REDACTED } from '../config-value.util';

@Injectable()
export class GetConfigService {
  constructor(private readonly repository: SystemConfigRepository) {}

  async execute(key: string) {
    const config = await this.repository.findByKey(key);

    if (!config) {
      throw new NotFoundException(`No configuration found for key "${key}".`);
    }

    return {
      ...config,
      value: config.isSecret
        ? REDACTED
        : parseConfigValue(config.value, config.valueType),
    };
  }

  /**
   * Reads a value for internal use, without redaction.
   *
   * Callers are other services, never a controller — this is how the
   * platform consumes its own settings.
   */
  async resolve(
    key: string,
    fallback: string | number | boolean | null = null,
  ) {
    const config = await this.repository.findByKey(key);

    if (!config) {
      return fallback;
    }

    return parseConfigValue(config.value, config.valueType);
  }
}
