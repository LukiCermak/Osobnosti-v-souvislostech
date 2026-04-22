import type { Transaction } from 'dexie';
import type { AppDatabaseSchema, MigrationDefinition, MetaRow } from '@/types/database';
import { confusionTable } from '@/db/tables/confusionTable';
import { knowledgeStateTable } from '@/db/tables/knowledgeStateTable';
import { metaTable } from '@/db/tables/metaTable';
import { progressSnapshotTable } from '@/db/tables/progressSnapshotTable';
import { sessionStateTable } from '@/db/tables/sessionStateTable';
import { userProfileTable } from '@/db/tables/userProfileTable';

export const DATABASE_NAME = 'osobnosti-v-souvislostech';
export const DATABASE_SCHEMA_VERSION = 2;

const version1Tables: MigrationDefinition['tables'] = {
  userProfiles: '&id, lastActiveAt, isFirstRun',
  knowledgeStates: '&id, unitKind, dueAt, lastAttemptAt, studyPriority, relationId, contrastSetId, pathId',
  confusions: '&id, sourceEntityId, confusedWithEntityId, lastOccurredAt, problemType',
  sessionStates: '&id, mode, status, updatedAt, startedAt, planId, currentTaskId',
  progressSnapshots: '&id, capturedAt',
  meta: '&key, updatedAt'
};

const version2Tables: MigrationDefinition['tables'] = {
  userProfiles: userProfileTable.schema,
  knowledgeStates: knowledgeStateTable.schema,
  confusions: confusionTable.schema,
  sessionStates: sessionStateTable.schema,
  progressSnapshots: progressSnapshotTable.schema,
  meta: metaTable.schema
};

export const migrations: MigrationDefinition[] = [
  {
    version: 1,
    description: 'Základní lokální úložiště studijního profilu, znalostí, relací a snapshotů.',
    tables: version1Tables
  },
  {
    version: 2,
    description: 'Rozšířené indexy pro vyhledání záměn, relací k opakování a obnovu rozehraných relací.',
    tables: version2Tables
  }
];

export async function stampSchemaVersion(transaction: Transaction, version: number): Promise<void> {
  const meta = transaction.table<MetaRow, string>('meta');
  await meta.put({
    key: 'db:schema-version',
    value: String(version),
    updatedAt: new Date().toISOString()
  });
}

export async function upgradeToVersion2(transaction: Transaction): Promise<void> {
  const knowledgeStates = transaction.table<AppDatabaseSchema['knowledgeStates'], string>('knowledgeStates');
  const confusions = transaction.table<AppDatabaseSchema['confusions'], string>('confusions');
  const userProfiles = transaction.table<AppDatabaseSchema['userProfiles'], string>('userProfiles');
  const sessionStates = transaction.table<AppDatabaseSchema['sessionStates'], string>('sessionStates');

  await knowledgeStates.toCollection().modify((row) => {
    row.entityIds = Array.isArray(row.entityIds) ? Array.from(new Set(row.entityIds)) : [];
    row.successCount = Math.max(0, Math.trunc(row.successCount ?? 0));
    row.errorCount = Math.max(0, Math.trunc(row.errorCount ?? 0));
    row.masteryScore = normalizeFraction(row.masteryScore);
    row.stabilityScore = normalizeFraction(row.stabilityScore);
  });

  await confusions.toCollection().modify((row) => {
    row.disciplineIds = Array.isArray(row.disciplineIds) ? Array.from(new Set(row.disciplineIds)) : [];
    row.count = Math.max(1, Math.trunc(row.count ?? 1));
  });

  await userProfiles.toCollection().modify((row) => {
    row.preferredDisciplineIds = Array.isArray(row.preferredDisciplineIds)
      ? Array.from(new Set(row.preferredDisciplineIds))
      : [];
    row.preferredDailyIntensity = row.preferredDailyIntensity ?? 'standard';
    row.isFirstRun = Boolean(row.isFirstRun);
  });

  await sessionStates.toCollection().modify((row) => {
    row.remainingTaskIds = Array.isArray(row.remainingTaskIds) ? Array.from(new Set(row.remainingTaskIds)) : [];
    row.completedTaskIds = Array.isArray(row.completedTaskIds) ? Array.from(new Set(row.completedTaskIds)) : [];
    row.status = row.status ?? 'active';
  });

  await stampSchemaVersion(transaction, 2);
}

function normalizeFraction(value: number | undefined): number {
  const fallback = 0;

  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(1, Math.max(0, value));
}
