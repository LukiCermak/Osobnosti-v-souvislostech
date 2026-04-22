import { isDefined } from '@/utils/assertions';

export function unique<T>(items: readonly T[]): T[] {
  return Array.from(new Set(items));
}

export function uniqueBy<T>(items: readonly T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();
  const output: T[] = [];

  items.forEach((item) => {
    const key = getKey(item);
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    output.push(item);
  });

  return output;
}

export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size <= 0) {
    return [];
  }

  const output: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    output.push(items.slice(index, index + size));
  }

  return output;
}

export function groupBy<T>(items: readonly T[], getKey: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const key = getKey(item);
    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(item);
    return groups;
  }, {});
}

export function sortBy<T>(items: readonly T[], compare: (left: T, right: T) => number): T[] {
  return [...items].sort(compare);
}

export function partition<T>(items: readonly T[], predicate: (item: T) => boolean): [T[], T[]] {
  return items.reduce<[T[], T[]]>(
    (accumulator, item) => {
      accumulator[predicate(item) ? 0 : 1].push(item);
      return accumulator;
    },
    [[], []]
  );
}

export function compact<T>(items: readonly (T | null | undefined | false)[]): T[] {
  return items.filter(isDefined).filter((item): item is T => Boolean(item));
}

export function sumBy<T>(items: readonly T[], getValue: (item: T) => number): number {
  return items.reduce((sum, item) => sum + getValue(item), 0);
}

export function take<T>(items: readonly T[], count: number): T[] {
  return items.slice(0, Math.max(0, count));
}
