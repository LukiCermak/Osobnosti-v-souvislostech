export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function unreachable(value: never, message?: string): never {
  throw new Error(message ?? `Nepodporovaná větev zpracování: ${String(value)}`);
}

export function requireValue<T>(value: T | null | undefined, message: string): T {
  invariant(value !== null && value !== undefined, message);
  return value;
}
