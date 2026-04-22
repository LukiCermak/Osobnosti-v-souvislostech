import { createSampleConfusions, createSampleExportPayload, createSampleKnowledgeStates, createSampleSession, createSampleSnapshot } from '../fixtures/sample-progress';
import { confusionRepository } from '@/db/repositories/confusionRepository';
import { knowledgeRepository } from '@/db/repositories/knowledgeRepository';
import { sessionRepository } from '@/db/repositories/sessionRepository';
import { snapshotRepository } from '@/db/repositories/snapshotRepository';
import { userProfileRepository } from '@/db/repositories/userProfileRepository';
import { exportProgress } from '@/db/backup/exportProgress';
import { importProgress } from '@/db/backup/importProgress';
import { getMetaValue } from '@/db/database';

describe('progress persistence', () => {
  it('uloží, exportuje a znovu importuje lokální progres', async () => {
    const payload = createSampleExportPayload();
    const primaryConfusion = createSampleConfusions()[0];
    await userProfileRepository.save(payload.data.userProfiles[0]);
    await knowledgeRepository.bulkUpsert(createSampleKnowledgeStates());
    await confusionRepository.record({ sourceEntityId: primaryConfusion.sourceEntityId, confusedWithEntityId: primaryConfusion.confusedWithEntityId, disciplineIds: primaryConfusion.disciplineIds, problemType: primaryConfusion.problemType, occurredAt: primaryConfusion.lastOccurredAt });
    await confusionRepository.record({ sourceEntityId: primaryConfusion.sourceEntityId, confusedWithEntityId: primaryConfusion.confusedWithEntityId, disciplineIds: primaryConfusion.disciplineIds, problemType: primaryConfusion.problemType, occurredAt: primaryConfusion.lastOccurredAt });
    await sessionRepository.save(createSampleSession());
    await snapshotRepository.save(createSampleSnapshot());
    const exported = await exportProgress();
    expect(exported.data.userProfiles).toHaveLength(1);
    expect(exported.data.knowledgeStates).toHaveLength(3);
    expect(exported.data.sessionStates[0]?.status).toBe('paused');
    await importProgress(payload, { clearExisting: true });
    expect((await userProfileRepository.getById('default-user'))?.preferredDisciplineIds).toEqual(['diagnostika']);
    expect((await sessionRepository.getResumeCandidate())?.id).toBe('session-atlas-1');
    expect(await knowledgeRepository.listDue('2026-04-22T10:00:00.000Z')).toHaveLength(2);
    expect((await snapshotRepository.latest())?.id).toBe('snapshot:2026-04-22T10:00:00.000Z');
    expect(await getMetaValue('backup:last-imported-at')).toBeTruthy();
  });
});
