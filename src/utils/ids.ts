import { slugify } from '@/utils/text';

export function createId(prefix: string, ...parts: Array<string | number | undefined>): string {
  const normalized = parts
    .filter((part): part is string | number => part !== undefined && part !== null)
    .map((part) => slugify(String(part)))
    .filter(Boolean);

  return [slugify(prefix), ...normalized].join(':');
}

export function createTimestampId(prefix: string): string {
  return `${slugify(prefix)}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`;
}

export function createSessionId(mode: string): string {
  return createTimestampId(`session-${mode}`);
}

export function createTaskId(mode: string, unitId: string, index: number): string {
  return createId(`${mode}-task`, unitId, index);
}
