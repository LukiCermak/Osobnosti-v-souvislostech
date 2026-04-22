import type { MetaRow } from '@/types/database';

export const metaTable = {
  name: 'meta',
  schema: '&key, updatedAt'
} as const;

export function createMetaRow(key: string, value: string, updatedAt: string): MetaRow {
  return { key, value, updatedAt };
}
