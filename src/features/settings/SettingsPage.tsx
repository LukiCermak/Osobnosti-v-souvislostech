import { useCallback, useEffect, useMemo, useState } from 'react';
import { createNavigationItems } from '@/app/navigation';
import { useTheme } from '@/app/providers/ThemeProvider';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/shared/Card';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { PrivacySettings } from '@/features/settings/PrivacySettings';
import { StorageSettings } from '@/features/settings/StorageSettings';
import { createSettingsPageViewModel } from '@/features/settings/settings.presenter';
import { resetDatabase } from '@/db/database';
import { useI18n } from '@/locale/i18n';
import { checkStorageHealth } from '@/services/storage/storageHealth';
import { useAppStore } from '@/state/appStore';

export function SettingsPage() {
  const { tString } = useI18n();
  const appState = useAppStore();
  const { mode, preference, toggleMode } = useTheme();
  const initializeApp = useAppStore((state) => state.initializeApp);
  const setStorageHealth = useAppStore((state) => state.setStorageHealth);
  const refreshDerivedState = useAppStore((state) => state.refreshDerivedState);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  const refreshStorageHealth = useCallback(async () => {
    try {
      const report = await checkStorageHealth();
      setStorageHealth(report);
    } catch (storageError) {
      setError(storageError instanceof Error ? storageError.message : 'Nepodarilo se overit lokalni uloziste.');
    }
  }, [setStorageHealth]);

  useEffect(() => {
    void refreshStorageHealth();
  }, [refreshStorageHealth]);

  const navigationItems = useMemo(
    () => createNavigationItems(tString, { includeSettings: true }),
    [tString]
  );

  const viewModel = useMemo(
    () => createSettingsPageViewModel(appState, appState.storageHealth, preference),
    [appState, preference]
  );

  const handleReset = async () => {
    const confirmed = window.confirm('Opravdu chcete vymazat lokalni progres a rozehrane relace v tomto zarizeni?');
    if (!confirmed) {
      return;
    }

    try {
      setError(undefined);
      await resetDatabase();
      await initializeApp(true);
      await refreshDerivedState();
      await refreshStorageHealth();
      setNotice('Lokalni data byla vymazana a aplikace pripravila cisty stav.');
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Nepodarilo se vymazat lokalni data.');
    }
  };

  return (
    <AppShell
      title={tString('settings.page.title')}
      subtitle={tString('settings.page.subtitle')}
      navigationItems={navigationItems}
    >
      {error ? (
        <ErrorState
          title={tString('settings.errors.title')}
          description={tString('settings.errors.text')}
          details={error}
          actionLabel={tString('common.actions.refresh')}
          onRetry={() => void refreshStorageHealth()}
        />
      ) : null}

      {notice ? <Card as="section" eyebrow="Stav" title={tString('settings.notice.title')} subtitle={notice} /> : null}

      {!appState.userProfile ? (
        <EmptyState
          eyebrow={tString('settings.empty.eyebrow')}
          title={tString('settings.empty.title')}
          description={tString('settings.empty.text')}
          action={{ label: tString('settings.actions.openOnboarding'), to: '/prvni-nastaveni' }}
        />
      ) : (
        <>
          <Card as="section" eyebrow="Profil" title={tString('settings.profile.title')} subtitle={tString('settings.profile.subtitle')}>
            <ul className="feature-list">
              <li>{`Osloveni: ${viewModel.pseudonym}`}</li>
              <li>{`Denni intenzita: ${viewModel.dailyIntensityLabel}`}</li>
              <li>{`Preferovane discipliny: ${viewModel.preferredDisciplineCount}`}</li>
              <li>{`Aktivni vzhled: ${mode === 'dark' ? 'Tmavy' : 'Svetly'}`}</li>
            </ul>
          </Card>

          <StorageSettings
            title={tString('settings.storage.title')}
            subtitle={tString('settings.storage.subtitle')}
            statusLabel={viewModel.storageStatusLabel}
            usageLabel={viewModel.storageUsageLabel}
            warnings={viewModel.storageWarnings}
            onRefresh={() => void refreshStorageHealth()}
            onReset={() => void handleReset()}
          />

          <PrivacySettings
            title={tString('settings.privacy.title')}
            subtitle={tString('settings.privacy.subtitle')}
            localOnlyText={tString('settings.privacy.localOnly')}
            appearanceTitle={tString('settings.appearance.title')}
            appearanceText={tString('settings.appearance.subtitle')}
            themeLabel={mode === 'dark' ? tString('common.actions.switchToLight') : tString('common.actions.switchToDark')}
            onToggleTheme={toggleMode}
          />
        </>
      )}
    </AppShell>
  );
}
