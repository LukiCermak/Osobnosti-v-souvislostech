import 'fake-indexeddb/auto';
import { afterEach, beforeEach } from 'vitest';
import Dexie from 'dexie';
import { DATABASE_NAME } from '@/db/migrations';
import { closeDatabase, resetDatabase } from '@/db/database';

beforeEach(async () => {
  await closeDatabase();
  await Dexie.delete(DATABASE_NAME);
});

afterEach(async () => {
  await resetDatabase();
  await Dexie.delete(DATABASE_NAME);
});
