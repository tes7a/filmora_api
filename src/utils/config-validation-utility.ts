import { validateSync } from 'class-validator';

export class ConfigValidationUtility {
  constructor() {}

  validateConfig(config: object) {
    const errors = validateSync(config, {
      whitelist: false,
      forbidUnknownValues: false,
    });

    if (errors.length > 0) {
      const messages = errors
        .flatMap((e) => Object.values(e.constraints ?? {}))
        .join('\n');

      throw new Error('Validation failed: ' + messages);
    }
  }

  convertToBoolean(value: string): boolean {
    const trimmedValue = value?.trim();

    if (trimmedValue === 'true') return true;
    if (trimmedValue === '1') return true;
    if (trimmedValue === 'enabled') return true;
    if (trimmedValue === 'false') return false;
    if (trimmedValue === '0') return false;
    if (trimmedValue === 'disabled') return false;

    return false;
  }

  getEnumValues<T extends Record<string, string>>(enumObj: T): string[] {
    return Object.values(enumObj);
  }
}
