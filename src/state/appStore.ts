import { create } from 'zustand';
import { buildContentIndex, type ContentIndex } from '@/core/content/contentIndex';
import { loadRuntimeContentBundle } from '@/core/content/contentLoader';
import type { RuntimeContentBundle } from '@/core/content/contentNormalizer';
import { buildDailyReviewPlan } from '@/core/progress/dailyPlanBuilder';
import { buildProgressSnapshot } from '@/core/progress/snapshotBuilder';
import { openDatabaseWithRecovery, setMetaValue } from '@/db/database';
import { confusionRepository } from '@/db/repositories/confusionRepository';
import { knowledgeRepository } from '@/db/repositories/knowledgeRepository';
import { sessionRepository } from '@/db/repositories/sessionRepository';
import { snapshotRepository } from '@/db/repositories/snapshotRepository';
import { userProfileRepository } from '@/db/repositories/userProfileRepository';
import type {
  ConfusionRecord,
  DailyReviewPlan,
  KnowledgeState,
  ProgressSnapshot,
  UserProfile
} from '@/types/progress';
import type { SessionStateRow } from '@/types/database';
import type { StudyMode } from '@/types/study';
import type { StorageHealthReport } from '@/services/storage/storageHealth';

export type BootstrapStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface AppStoreState {
  bootstrapStatus: BootstrapStatus;
  lastError?: string;
  initializedAt?: string;
  contentBundle?: RuntimeContentBundle;
  contentIndex?: ContentIndex;
  contentVersion?: string;
  userProfile?: UserProfile;
  resumeSession?: SessionStateRow;
  dailyReviewPlan?: DailyReviewPlan;
  latestSnapshot?: ProgressSnapshot;
  activeMode?: StudyMode;
  databaseRecovered: boolean;
  storageHealth?: StorageHealthReport;
  initializeApp: (forceReload?: boolean) => Promise<void>;
  refreshDerivedState: () => Promise<void>;
  setActiveMode: (mode?: StudyMode) => void;
  setStorageHealth: (report: StorageHealthReport) => void;
  updateUserPreferences: (patch: {
    preferredDisciplineIds?: string[];
    preferredDailyIntensity?: UserProfile['preferredDailyIntensity'];
    pseudonym?: string;
    isFirstRun?: boolean;
  }) => Promise<UserProfile>;
  dismissError: () => void;
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  bootstrapStatus: 'idle',
  databaseRecovered: false,

  async initializeApp(forceReload = false) {
    const currentStatus = get().bootstrapStatus;
    if (currentStatus === 'loading') {
      return;
    }

    set({
      bootstrapStatus: 'loading',
      lastError: undefined
    });

    try {
      const [{ recovered }, bundle] = await Promise.all([
        openDatabaseWithRecovery(),
        loadRuntimeContentBundle(forceReload)
      ]);

      const index = buildContentIndex(bundle);
      await setMetaValue('content:version', bundle.version.version);
      await setMetaValue('content:loaded-at', new Date().toISOString());

      set({
        contentBundle: bundle,
        contentIndex: index,
        contentVersion: bundle.version.version,
        databaseRecovered: recovered,
        bootstrapStatus: 'ready',
        initializedAt: new Date().toISOString()
      });

      await get().refreshDerivedState();
    } catch (error) {
      set({
        bootstrapStatus: 'error',
        lastError: error instanceof Error ? error.message : 'Nepodařilo se připravit aplikaci.'
      });
    }
  },

  async refreshDerivedState() {
    const index = get().contentIndex;
    if (!index) {
      return;
    }

    try {
      const [userProfile, knowledgeRows, confusionRows, resumeSession, latestSnapshot] = await Promise.all([
        userProfileRepository.getOrCreateDefault(),
        knowledgeRepository.listAll(),
        confusionRepository.listTop(20),
        sessionRepository.getResumeCandidate(),
        snapshotRepository.latest()
      ]);

      const knowledgeStates = toKnowledgeStates(knowledgeRows);
      const confusions = toConfusionRecords(confusionRows);
      const dailyReviewPlan = buildDailyReviewPlan(knowledgeStates, confusions);
      const snapshot = latestSnapshot ?? buildProgressSnapshot(index, knowledgeStates, confusions);

      if (!latestSnapshot) {
        await snapshotRepository.save(snapshot);
      }

      await userProfileRepository.touchLastActive(userProfile.id);

      set({
        userProfile: {
          ...userProfile,
          lastActiveAt: new Date().toISOString()
        },
        resumeSession,
        dailyReviewPlan,
        latestSnapshot: snapshot,
        activeMode: resumeSession?.mode ?? dailyReviewPlan.recommendedModes[0] ?? get().activeMode
      });
    } catch (error) {
      set({
        bootstrapStatus: 'error',
        lastError: error instanceof Error ? error.message : 'Nepodařilo se načíst odvozený stav aplikace.'
      });
    }
  },

  setActiveMode(mode) {
    set({ activeMode: mode });
  },

  setStorageHealth(storageHealth) {
    set({ storageHealth });
  },

  async updateUserPreferences(patch) {
    const profile = await userProfileRepository.updatePreferences(patch);
    set({ userProfile: profile });
    await get().refreshDerivedState();
    return profile;
  },

  dismissError() {
    set({ lastError: undefined });
  }
}));

function toKnowledgeStates(rows: Awaited<ReturnType<typeof knowledgeRepository.listAll>>): KnowledgeState[] {
  return rows as unknown as KnowledgeState[];
}

function toConfusionRecords(rows: Awaited<ReturnType<typeof confusionRepository.listTop>>): ConfusionRecord[] {
  return rows as unknown as ConfusionRecord[];
}
