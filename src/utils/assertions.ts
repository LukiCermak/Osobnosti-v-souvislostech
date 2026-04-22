export function assert(condition: unknown, message = 'Došlo k porušení očekávané podmínky.'): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function invariant<T>(value: T | null | undefined, message = 'Očekávaná hodnota chybí.'): T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }

  return value;
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export function exhaustiveGuard(value: never, message = 'Neobsloužená větev podmínky.'): never {
  throw new Error(`${message} Hodnota: ${String(value)}`);
}
