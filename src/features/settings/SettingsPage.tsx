import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Card } from '@/components/shared/Card';
import { PrivacySettings } from '@/features/settings/PrivacySettings';
import { StorageSettings } from '@/features/settings/StorageSettings';
import { createSettingsPageViewModel } from '@/features/settings/settings.presenter';
import { exportProgressAsBlob, createExportFilename } from '@/db/backup/exportProgress';
import { importProgressFromFile } from '@/db/backup/importProgress';
import { resetDatabase } from '@/db/database';
import { checkStorageHealth } from '@/services/storage/storageHealth';
import { useI18n } from '@/locale/i18n';
import { useAppStore } from '@/state/appStore';
import { useTheme } from '@/app/providers/ThemeProvider';
import type { NavigationItem } from '@/types/ui';

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

  useEffect(() => {
    void refreshStorageHealth();
  }, []);

  async function refreshStorageHealth() {
    try {
      const report = await checkStorageHealth();
      setStorageHealth(report);
    } catch (storageError) {
      setError(storageError instanceof Error ? storageError.message : 'Nepodařilo se ověřit lokální úložiště.');
    }
  }

  const navigationItems = useMemo<NavigationItem[]>(() => [
    { id: 'home', path: '/', label: tString('common.navigation.home') },
    { id: 'atlas', path: '/atlas', label: tString('common.navigation.atlas'), mode: 'atlas' },
    { id: 'cases', path: '/detektivni-spisy', label: tString('common.navigation.cases'), mode: 'cases' },
    { id: 'lab', path: '/laborator-rozliseni', label: tString('common.navigation.lab'), mode: 'lab' },
    { id: 'progress', path: '/pokrok', label: tString('common.navigation.progress') },
    { id: 'review', path: '/opakovani', label: tString('common.navigation.review') },
    { id: 'settings', path: '/nastaveni', label: tString('common.navigation.settings') }
  ], [tString]);

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
