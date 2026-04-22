import type { AppStoreState } from '@/state/appStore';
import type { StorageHealthReport } from '@/services/storage/storageHealth';

export interface SettingsPageViewModel {
  pseudonym: string;
  dailyIntensityLabel: string;
  preferredDisciplineCount: number;
  storageStatusLabel: string;
  storageUsageLabel: string;
  storageWarnings: string[];
}

export function createSettingsPageViewModel(
  state: AppStoreState,
  storageReport: StorageHealthReport | undefined,
  themePreference: 'system' | 'light' | 'dark'
): SettingsPageViewModel {
  return {
    pseudonym: state.userProfile?.pseudonym ?? 'Bez zadaneho jmena',
    dailyIntensityLabel: resolveIntensityLabel(state.userProfile?.preferredDailyIntensity),
    preferredDisciplineCount: state.userProfile?.preferredDisciplineIds.length ?? 0,
    storageStatusLabel: resolveStorageStatusLabel(storageReport?.status),
    storageUsageLabel:
      state.storageHealth?.estimate.usage !== undefined && state.storageHealth?.estimate.quota !== undefined
        ? `${Math.round((state.storageHealth.estimate.usage / 1024 / 1024) * 10) / 10} MB / ${Math.round((state.storageHealth.estimate.quota / 1024 / 1024) * 10) / 10} MB`
        : 'Kapacita zatim neni dostupna',
    storageWarnings: [
      ...(storageReport?.warnings ?? []),
      themePreference === 'system' ? 'Vzhled se ridi nastavenim zarizeni.' : ''
    ].filter(Boolean)
  };
}

function resolveIntensityLabel(value?: 'light' | 'standard' | 'deep'): string {
  switch (value) {
    case 'light':
      return 'Lehka';
    case 'deep':
      return 'Hlubsi';
    case 'standard':
    default:
      return 'Standardni';
  }
}

function resolveStorageStatusLabel(status?: StorageHealthReport['status']): string {
  switch (status) {
    case 'good':
      return 'Uloziste je v poradku';
    case 'warning':
      return 'Uloziste se blizi kapacite';
    case 'critical':
      return 'Uloziste je temer zaplnene';
    case 'unavailable':
      return 'Uloziste neni k dispozici';
    default:
      return 'Stav uloziste se nacita';
  }
}
