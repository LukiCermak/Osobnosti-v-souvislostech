import type { ExportedDatabasePayload } from '@/types/database';
import { openDatabase } from '@/db/database';
import { DATABASE_SCHEMA_VERSION } from '@/db/migrations';
import { normalizeConfusionRow } from '@/db/tables/confusionTable';
import { normalizeKnowledgeStateRow } from '@/db/tables/knowledgeStateTable';
import { normalizeProgressSnapshotRow } from '@/db/tables/progressSnapshotTable';
import { normalizeSessionStateRow } from '@/db/tables/sessionStateTable';
import { normalizeUserProfileRow } from '@/db/tables/userProfileTable';

export async function importProgress(payload: ExportedDatabasePayload, options?: { clearExisting?: boolean }): Promise<void> {
  assertImportPayload(payload);
  const database = await openDatabase();

  await database.transaction('rw', database.tables, async () => {
      if (options?.clearExisting) {
        await Promise.all([
          database.userProfiles.clear(),
          database.knowledgeStates.clear(),
          database.confusions.clear(),
          database.sessionStates.clear(),
          database.progressSnapshots.clear()
        ]);
      }

      await Promise.all([
        database.userProfiles.bulkPut(payload.data.userProfiles.map(normalizeUserProfileRow)),
        database.knowledgeStates.bulkPut(payload.data.knowledgeStates.map(normalizeKnowledgeStateRow)),
        database.confusions.bulkPut(payload.data.confusions.map(normalizeConfusionRow)),
        database.sessionStates.bulkPut(payload.data.sessionStates.map(normalizeSessionStateRow)),
        database.progressSnapshots.bulkPut(payload.data.progressSnapshots.map(normalizeProgressSnapshotRow))
      ]);

      await database.meta.put({
        key: 'backup:last-imported-at',
        value: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      if (payload.contentVersion) {
        await database.meta.put({
          key: 'content:version',
          value: payload.contentVersion,
          updatedAt: new Date().toISOString()
        });
      }
    }
  );
}

export async function importProgressFromFile(file: File, options?: { clearExisting?: boolean }): Promise<void> {
  const content = await file.text();
  const parsed = JSON.parse(content) as ExportedDatabasePayload;
  await importProgress(parsed, options);
}

function assertImportPayload(payload: ExportedDatabasePayload): void {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Importovaný soubor nemá platnou strukturu.');
  }

  if (payload.schemaVersion > DATABASE_SCHEMA_VERSION) {
    throw new Error('Záloha pochází z novější verze aplikace a nelze ji bezpečně načíst.');
  }

  if (!payload.data) {
    throw new Error('Importovaný soubor neobsahuje datovou část.');
  }

  if (!Array.isArray(payload.data.userProfiles) || !Array.isArray(payload.data.knowledgeStates)) {
    throw new Error('Importovaný soubor má poškozenou strukturu uživatelských dat.');
  }

  if (!Array.isArray(payload.data.confusions) || !Array.isArray(payload.data.sessionStates) || !Array.isArray(payload.data.progressSnapshots)) {
    throw new Error('Importovaný soubor má poškozenou strukturu studijních dat.');
  }
}
