import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { createNavigationItems } from '@/app/navigation';
import { useTheme } from '@/app/providers/ThemeProvider';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/shared/Card';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { PrivacySettings } from '@/features/settings/PrivacySettings';
import { StorageSettings } from '@/features/settings/StorageSettings';
import { createSettingsPageViewModel } from '@/features/settings/settings.presenter';
import { exportProgressAsBlob, createExportFilename } from '@/db/backup/exportProgress';
import { importProgressFromFile } from '@/db/backup/importProgress';
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
  const inputRef = useRef<HTMLInputElement | null>(null);

  const refreshStorageHealth = useCallback(async () => {
    try {
      const report = await checkStorageHealth();
      setStorageHealth(report);
    } catch (storageError) {
      setError(storageError instanceof Error ? storageError.message : 'Nepodařilo se ověřit lokální úložiště.');
    }
  }, [setStorageHealth]);

  useEffect(() => {
    void refreshStorageHealth();
  }, [refreshStorageHealth]);

  const navigationItems = useMemo(
    () => createNavigationItems(tString, { includeReview: true, includeSettings: true }),
    [tString]
  );

  const viewModel = useMemo(
    () => createSettingsPageViewModel(appState, appState.storageHealth, preference),
    [appState, preference]
  );

  const handleExport = async () => {
    try {
      setError(undefined);
      const blob = await exportProgressAsBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = createExportFilename();
      link.click();
      URL.revokeObjectURL(url);
      setNotice('Záloha lokálního progresu byla připravena ke stažení.');
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : 'Export lokálních dat se nezdařil.');
    }
  };

  const handleImportClick = () => {
    inputRef.current?.click();
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setError(undefined);
      await importProgressFromFile(file, { clearExisting: true });
      await initializeApp(true);
      await refreshDerivedState();
      await refreshStorageHealth();
      setNotice('Import lokálních dat byl dokončen.');
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Import lokálních dat se nezdařil.');
    } finally {
      event.target.value = '';
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm('Opravdu chcete vymazat lokální progres a rozehrané relace v tomto zařízení?');
    if (!confirmed) {
      return;
    }

    try {
      setError(undefined);
      await resetDatabase();
      await initializeApp(true);
      await refreshStorageHealth();
      setNotice('Lokální data byla vymazána a aplikace připravila čistý stav.');
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Nepodařilo se vymazat lokální data.');
    }
  };

  return (
    <AppShell
      title={tString('settings.page.title')}
      subtitle={tString('settings.page.subtitle')}
      eyebrow={tString('settings.page.eyebrow')}
      navigationItems={navigationItems}
      sidebarTitle={tString('settings.sidebar.title')}
      sidebarFooter={<p className="text-body">{tString('settings.sidebar.footer')}</p>}
    >
      <input ref={inputRef} type="file" accept="application/json" className="visually-hidden" onChange={(event) => void handleImport(event)} />

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
              <li>{`Oslovení: ${viewModel.pseudonym}`}</li>
              <li>{`Denní intenzita: ${viewModel.dailyIntensityLabel}`}</li>
              <li>{`Preferované disciplíny: ${viewModel.preferredDisciplineCount}`}</li>
              <li>{`Aktivní vzhled: ${mode === 'dark' ? 'Tmavý' : 'Světlý'}`}</li>
            </ul>
          </Card>

          <StorageSettings
            title={tString('settings.storage.title')}
            subtitle={tString('settings.storage.subtitle')}
            statusLabel={viewModel.storageStatusLabel}
            usageLabel={viewModel.storageUsageLabel}
            warnings={viewModel.storageWarnings}
            onExport={() => void handleExport()}
            onImportClick={handleImportClick}
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
