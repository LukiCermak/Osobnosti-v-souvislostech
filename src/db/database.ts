import Dexie, { type Table } from 'dexie';
import type { AppDatabaseSchema, DatabaseHealth, MetaRow } from '@/types/database';
import { DATABASE_NAME, DATABASE_SCHEMA_VERSION, migrations, upgradeToVersion2 } from '@/db/migrations';

export class StudyDatabase extends Dexie {
  userProfiles!: Table<AppDatabaseSchema['userProfiles'], string>;
  knowledgeStates!: Table<AppDatabaseSchema['knowledgeStates'], string>;
  confusions!: Table<AppDatabaseSchema['confusions'], string>;
  sessionStates!: Table<AppDatabaseSchema['sessionStates'], string>;
  progressSnapshots!: Table<AppDatabaseSchema['progressSnapshots'], string>;
  meta!: Table<AppDatabaseSchema['meta'], string>;

  constructor() {
    super(DATABASE_NAME);

    this.version(migrations[0].version).stores(migrations[0].tables);
    this.version(migrations[1].version)
      .stores(migrations[1].tables)
      .upgrade(upgradeToVersion2);
  }
}

let databaseInstance: StudyDatabase | null = null;

export function getDatabase(): StudyDatabase {
  if (!databaseInstance) {
    databaseInstance = new StudyDatabase();
  }

  return databaseInstance;
}

export async function openDatabase(): Promise<StudyDatabase> {
  const database = getDatabase();

  if (!database.isOpen()) {
    await database.open();
  }

  return database;
}

export async function closeDatabase(): Promise<void> {
  if (databaseInstance?.isOpen()) {
    databaseInstance.close();
  }
}

export async function openDatabaseWithRecovery(): Promise<{ database: StudyDatabase; recovered: boolean }> {
  try {
    const database = await openDatabase();
    return { database, recovered: false };
  } catch (error) {
    const database = getDatabase();
    database.close();
    await database.delete();
    databaseInstance = null;

    const recoveredDatabase = await openDatabase();
    await recoveredDatabase.meta.put({
      key: 'db:last-recovery-reason',
      value: error instanceof Error ? error.message : 'Neznámá chyba databáze.',
      updatedAt: new Date().toISOString()
    });

    return { database: recoveredDatabase, recovered: true };
  }
}

export async function resetDatabase(): Promise<void> {
  const database = getDatabase();
  await closeDatabase();
  await database.delete();
  databaseInstance = null;
}

export async function setMetaValue(key: string, value: string): Promise<void> {
  const database = await openDatabase();
  const row: MetaRow = {
    key,
    value,
    updatedAt: new Date().toISOString()
  };

  await database.meta.put(row);
}

export async function getMetaValue(key: string): Promise<string | undefined> {
  const database = await openDatabase();
  const row = await database.meta.get(key);
  return row?.value;
}

export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  try {
    const database = await openDatabase();
    const [userProfiles, knowledgeStates, confusions, sessionStates, progressSnapshots, meta] = await Promise.all([
      database.userProfiles.count(),
      database.knowledgeStates.count(),
      database.confusions.count(),
      database.sessionStates.count(),
      database.progressSnapshots.count(),
      database.meta.count()
    ]);

    return {
      isOpen: database.isOpen(),
      schemaVersion: DATABASE_SCHEMA_VERSION,
      tableCounts: {
        userProfiles,
        knowledgeStates,
        confusions,
        sessionStates,
        progressSnapshots,
        meta
      }
    };
  } catch (error) {
    return {
      isOpen: false,
      schemaVersion: DATABASE_SCHEMA_VERSION,
      tableCounts: {
        userProfiles: 0,
        knowledgeStates: 0,
        confusions: 0,
        sessionStates: 0,
        progressSnapshots: 0,
        meta: 0
      },
      lastError: error instanceof Error ? error.message : 'Neznámá chyba databáze.'
    };
  }
}
