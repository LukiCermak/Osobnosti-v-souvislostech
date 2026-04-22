import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { ErrorState } from '@/components/shared/ErrorState';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { DisciplinePicker } from '@/features/onboarding/DisciplinePicker';
import {
  createInitialOnboardingDraft,
  createOnboardingViewModel,
  toggleDisciplineSelection,
  type OnboardingDraft
} from '@/features/onboarding/onboarding.presenter';
import { useI18n } from '@/locale/i18n';
import { useAppStore } from '@/state/appStore';
import { useUiStore } from '@/state/uiStore';
import type { NavigationItem } from '@/types/ui';

const navigationItems: NavigationItem[] = [
  { id: 'home', path: '/', label: 'Hlavní stránka' },
  { id: 'onboarding', path: '/prvni-nastaveni', label: 'První nastavení' }
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { tString } = useI18n();
  const profile = useAppStore((state) => state.userProfile);
  const updateUserPreferences = useAppStore((state) => state.updateUserPreferences);
  const setLastVisitedRoute = useUiStore((state) => state.setLastVisitedRoute);

  const [draft, setDraft] = useState<OnboardingDraft>(() => createInitialOnboardingDraft(profile));
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const profileSignature = useMemo(
    () =>
      JSON.stringify({
        id: profile?.id,
        preferredDailyIntensity: profile?.preferredDailyIntensity,
        preferredDisciplineIds: profile?.preferredDisciplineIds ?? []
      }),
    [profile]
  );

  useEffect(() => {
    setDraft(createInitialOnboardingDraft(profile));
  }, [profile, profileSignature]);

  const viewModel = useMemo(() => createOnboardingViewModel({ profile, draft }), [profile, draft]);

  const handleSubmit = async () => {
    if (!viewModel.canSubmit) {
      setError(tString('onboarding.validation.disciplineRequired'));
      return;
    }

    setSaving(true);
    setError(undefined);

    try {
      await updateUserPreferences({
        preferredDisciplineIds: draft.preferredDisciplineIds,
        preferredDailyIntensity: draft.preferredDailyIntensity,
        isFirstRun: false
      });
      setLastVisitedRoute('home');
      navigate('/');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tString('onboarding.validation.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      title={tString('common.navigation.onboarding')}
      subtitle={tString('onboarding.subtitle')}
      navigationItems={navigationItems}
      actions={
        <div className="button-row">
          <Button variant="secondary" to="/">
            {tString('onboarding.actions.skipToHome')}
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={!viewModel.canSubmit || saving}>
            {saving ? tString('onboarding.actions.saving') : tString('onboarding.actions.finish')}
          </Button>
        </div>
      }
    >
      <Card
        as="section"
        highlight
        eyebrow={tString('onboarding.hero.kicker')}
        title={tString('onboarding.title')}
        subtitle={tString('onboarding.intro')}
      />

      {error ? <ErrorState title={tString('onboarding.validation.title')} description={error} /> : null}

      <SectionTitle
        title={tString('onboarding.sections.disciplinesTitle')}
        subtitle={tString('onboarding.sections.disciplinesText')}
      />
      <DisciplinePicker
        options={viewModel.availableDisciplines}
        selectedIds={draft.preferredDisciplineIds}
        onToggle={(disciplineId) =>
          setDraft((current) => ({
            ...current,
            preferredDisciplineIds: toggleDisciplineSelection(current.preferredDisciplineIds, disciplineId)
          }))
        }
      />

      <div className="grid grid-2 onboarding-settings-grid">
        <Card as="section" eyebrow={tString('onboarding.sections.intensityEyebrow')} title={tString('onboarding.sections.intensityTitle')}>
          <div className="intensity-choice-group" role="radiogroup" aria-label={tString('onboarding.sections.intensityTitle')}>
            {(['light', 'standard', 'deep'] as const).map((intensity) => (
              <button
                key={intensity}
                type="button"
                role="radio"
                aria-checked={draft.preferredDailyIntensity === intensity}
                className={draft.preferredDailyIntensity === intensity ? 'intensity-choice is-selected' : 'intensity-choice'}
                onClick={() => setDraft((current) => ({ ...current, preferredDailyIntensity: intensity }))}
              >
                <strong>{tString(`onboarding.intensity.${intensity}.title`)}</strong>
                <span className="text-body">{tString(`onboarding.intensity.${intensity}.description`)}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card as="section" eyebrow={tString('onboarding.sections.summaryEyebrow')} title={tString('onboarding.sections.summaryTitle')}>
          <ul className="feature-list">
            <li>{`${tString('onboarding.summary.disciplines')}: ${draft.preferredDisciplineIds.length}`}</li>
            <li>{`${tString('onboarding.summary.intensity')}: ${tString(`common.profile.intensity.${draft.preferredDailyIntensity}`)}`}</li>
            <li>{tString('onboarding.summary.storage')}</li>
          </ul>
          <div className="button-row">
            <Button variant="secondary" to="/">
              {tString('onboarding.actions.returnHome')}
            </Button>
            <Button onClick={() => void handleSubmit()} disabled={!viewModel.canSubmit || saving}>
              {saving ? tString('onboarding.actions.saving') : tString('onboarding.actions.finish')}
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
