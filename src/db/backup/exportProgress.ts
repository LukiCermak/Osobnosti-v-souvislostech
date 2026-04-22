import type { ExportedDatabasePayload } from '@/types/database';
import { getMetaValue, openDatabase } from '@/db/database';
import { DATABASE_SCHEMA_VERSION } from '@/db/migrations';

export async function exportProgress(): Promise<ExportedDatabasePayload> {
  const database = await openDatabase();
  const [userProfiles, knowledgeStates, confusions, sessionStates, progressSnapshots, contentVersion] = await Promise.all([
    database.userProfiles.toArray(),
    database.knowledgeStates.toArray(),
    database.confusions.toArray(),
    database.sessionStates.toArray(),
    database.progressSnapshots.toArray(),
    getMetaValue('content:version')
  ]);

  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: DATABASE_SCHEMA_VERSION,
    contentVersion,
    appVersion: undefined,
    data: {
      userProfiles,
      knowledgeStates,
      confusions,
      sessionStates,
      progressSnapshots,
      meta: []
    }
  };
}

export async function exportProgressAsBlob(): Promise<Blob> {
  const payload = await exportProgress();
  return new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8'
  });
}

export function createExportFilename(referenceDate = new Date()): string {
  const stamp = referenceDate.toISOString().replace(/[:.]/g, '-');
  return `osobnosti-v-souvislostech-zaloha-${stamp}.json`;
}
