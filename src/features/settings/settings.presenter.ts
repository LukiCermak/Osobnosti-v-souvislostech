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
    pseudonym: state.userProfile?.pseudonym ?? 'Bez zadaného jména',
    dailyIntensityLabel: resolveIntensityLabel(state.userProfile?.preferredDailyIntensity),
    preferredDisciplineCount: state.userProfile?.preferredDisciplineIds.length ?? 0,
    storageStatusLabel: resolveStorageStatusLabel(storageReport?.status),
    storageUsageLabel: state.storageHealth?.estimate.usage !== undefined && state.storageHealth?.estimate.quota !== undefined
      ? `${Math.round((state.storageHealth.estimate.usage / 1024 / 1024) * 10) / 10} MB / ${Math.round((state.storageHealth.estimate.quota / 1024 / 1024) * 10) / 10} MB`
      : 'Kapacita zatím není dostupná',
    storageWarnings: [
      ...(storageReport?.warnings ?? []),
      themePreference === 'system' ? 'Vzhled se řídí nastavením zařízení.' : ''
    ].filter(Boolean)
  };
}

function resolveIntensityLabel(value?: 'light' | 'standard' | 'deep'): string {
  switch (value) {
    case 'light':
      return 'Lehká';
    case 'deep':
      return 'Hlubší';
    case 'standard':
    default:
      return 'Standardní';
  }
}

function resolveStorageStatusLabel(status?: StorageHealthReport['status']): string {
  switch (status) {
    case 'good':
      return 'Úložiště je v pořádku';
    case 'warning':
      return 'Úložiště se blíží kapacitě';
    case 'critical':
      return 'Úložiště je téměř zaplněné';
    case 'unavailable':
      return 'Úložiště není k dispozici';
    default:
      return 'Stav úložiště se načítá';
  }
}
