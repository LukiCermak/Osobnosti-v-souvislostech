import type { AppStoreState } from '@/state/appStore';
import type { StudyMode } from '@/types/study';
import type { ContentIndex } from '@/core/content/contentIndex';
import {
  selectHomeCompletionRatio,
  selectHomeDisciplineSummaries,
  selectHomeRecommendedMode,
  selectHomeRecommendedReason,
  selectHomeWeaknessSummaries,
  type HomeDisciplineSummary,
  type HomeWeaknessSummary
} from '@/features/home/home.selectors';

export interface HomeModeCard {
  id: StudyMode;
  title: string;
  description: string;
  to: string;
}

export interface HomeHighlightItem {
  id: string;
  label: string;
  value: string;
}

export interface HomePageViewModel {
  needsOnboarding: boolean;
  recommendedMode: StudyMode;
  recommendedModeLabel: string;
  recommendedActionTitle: string;
  recommendedActionDescription: string;
  recommendedActionTo: string;
  recommendedActionLabel: string;
  resumeAvailable: boolean;
  dueTodayCount: number;
  totalUnits: number;
  completionRatio: number;
  completionLabel: string;
  highlightItems: HomeHighlightItem[];
  disciplineBars: Array<HomeDisciplineSummary & { label: string; subtitle: string }>;
  weaknessItems: HomeWeaknessSummary[];
  modeCards: HomeModeCard[];
}

export function createHomePageViewModel(state: AppStoreState): HomePageViewModel {
  const recommendedMode = selectHomeRecommendedMode(state);
  const recommendedReason = selectHomeRecommendedReason(state);
  const disciplineBars = selectHomeDisciplineSummaries(state).map((item) => ({
    ...item,
    label: resolveDisciplineLabel(item.id),
    subtitle: `Osobnosti ${item.totalPeople}, pojmy ${item.totalConcepts}`
  }));
  const weaknessItems = selectHomeWeaknessSummaries(state);
  const completionRatio = selectHomeCompletionRatio(state);
  const totalUnits = state.latestSnapshot?.totalUnits ?? 0;
  const dueTodayCount = state.dailyReviewPlan?.dueStateIds.length ?? 0;
  const resumeAvailable = Boolean(state.resumeSession);
  const needsOnboarding = Boolean(state.userProfile?.isFirstRun);

  return {
    needsOnboarding,
    recommendedMode,
    recommendedModeLabel: resolveModeLabel(recommendedMode),
    recommendedActionTitle: getRecommendedActionTitle(recommendedReason, recommendedMode),
    recommendedActionDescription: getRecommendedActionDescription(recommendedReason, dueTodayCount),
    recommendedActionTo: needsOnboarding ? '/prvni-nastaveni' : modeToPath(recommendedMode),
    recommendedActionLabel: needsOnboarding ? 'Dokončit první nastavení' : getRecommendedActionLabel(recommendedReason),
    resumeAvailable,
    dueTodayCount,
    totalUnits,
    completionRatio,
    completionLabel: totalUnits > 0 ? `${Math.round(completionRatio * 100)} % upevněných jednotek` : 'Pokrok se začne počítat po první relaci',
    highlightItems: buildHighlightItems(state, dueTodayCount),
    disciplineBars,
    weaknessItems,
    modeCards: [
      {
        id: 'atlas',
        title: 'Atlas souvislostí',
        description: 'Pro orientaci v oboru, trasách a vazbách mezi osobnostmi, pojmy a institucemi.',
        to: '/atlas'
      },
      {
        id: 'cases',
        title: 'Detektivní spisy',
        description: 'Pro delší úlohy s indiciemi, syntézou a návratem k náročnějším vazbám.',
        to: '/detektivni-spisy'
      },
      {
        id: 'lab',
        title: 'Laboratoř rozlišení',
        description: 'Pro rychlé rozlišování podobných jmen, linií a častých záměn.',
        to: '/laborator-rozliseni'
      }
    ]
  };
}

export function resolveDisciplineLabel(disciplineId: string): string {
  return disciplineLabelMap[disciplineId] ?? humanizeSlug(disciplineId);
}

export function resolveModeLabel(mode: StudyMode): string {
  switch (mode) {
    case 'atlas':
      return 'Atlas souvislostí';
    case 'cases':
      return 'Detektivní spisy';
    case 'lab':
      return 'Laboratoř rozlišení';
  }
}

export function describeHomeCoverage(index?: ContentIndex): string {
  if (!index) {
    return 'Obsah aplikace se načítá.';
  }

  return `${index.people.size} osobností, ${index.concepts.size} pojmů a ${index.relations.size} vazeb připravených ke studiu.`;
}

function buildHighlightItems(state: AppStoreState, dueTodayCount: number): HomeHighlightItem[] {
  const preferredDisciplines = state.userProfile?.preferredDisciplineIds.length ?? 0;
  const resumeCount = state.resumeSession
    ? state.resumeSession.remainingTaskIds.length + (state.resumeSession.currentTaskId ? 1 : 0)
    : 0;

  return [
    {
      id: 'discipline-count',
      label: 'Preferované disciplíny',
      value: String(preferredDisciplines)
    },
    {
      id: 'resume-count',
      label: 'Rozpracované kroky',
      value: String(resumeCount)
    },
    {
      id: 'review-count',
      label: 'Dnes k opakování',
      value: String(dueTodayCount)
    }
  ];
}

function getRecommendedActionTitle(reason: ReturnType<typeof selectHomeRecommendedReason>, mode: StudyMode): string {
  switch (reason) {
    case 'first-run':
      return 'Začni krátkým nastavením vstupu';
    case 'resume':
      return 'Navážeš přesně tam, kde ses zastavil';
    case 'similar-person-confusion':
      return mode === 'lab'
        ? 'Největší přínos teď přinese Laboratoř rozlišení'
        : `Teď se vyplatí pokračovat v režimu ${resolveModeLabel(mode)}`;
    default:
      return `Můžeš pokračovat v režimu ${resolveModeLabel(mode)}`;
  }
}

function getRecommendedActionDescription(
  reason: ReturnType<typeof selectHomeRecommendedReason>,
  dueTodayCount: number
): string {
  switch (reason) {
    case 'first-run':
      return 'Vybereš si preferované disciplíny a nastavíš denní intenzitu, aby doporučení od začátku dávala smysl.';
    case 'resume':
      return 'Aplikace si pamatuje poslední relaci i nedokončené kroky. Nemusíš začínat znovu.';
    case 'similar-person-confusion':
      return 'Historie záměn ukazuje, že největší efekt přinese cílené rozlišování podobných osobností a vazeb.';
    default:
      return dueTodayCount > 0
        ? `Dnes už čeká ${dueTodayCount} jednotek k opakování, takže se vyplatí navázat na průběžné upevňování.`
        : 'Můžeš si zvolit režim podle toho, zda chceš mapovat vztahy, řešit případ nebo rychle odlišovat podobná jména.';
  }
}

function getRecommendedActionLabel(reason: ReturnType<typeof selectHomeRecommendedReason>): string {
  switch (reason) {
    case 'resume':
      return 'Pokračovat ve studiu';
    case 'similar-person-confusion':
      return 'Otevřít doporučený režim';
    default:
      return 'Začít studijní blok';
  }
}

function modeToPath(mode: StudyMode): string {
  switch (mode) {
    case 'atlas':
      return '/atlas';
    case 'cases':
      return '/detektivni-spisy';
    case 'lab':
      return '/laborator-rozliseni';
  }
}

function humanizeSlug(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const disciplineLabelMap: Record<string, string> = {
  'specialni-pedagogika-a-dejiny-oboru': 'Speciální pedagogika a dějiny oboru',
  psychopedie: 'Psychopedie',
  somatopedie: 'Somatopedie',
  logopedie: 'Logopedie',
  surdopedie: 'Surdopedie',
  tyflopedie: 'Tyflopedie',
  etopedie: 'Etopedie',
  'diagnostika-a-psychometrie': 'Diagnostika a psychometrie',
  'psychologie-psychiatrie-a-psychoterapie': 'Psychologie, psychiatrie a psychoterapie',
  'andragogika-a-gerontagogika': 'Andragogika a gerontagogika',
  'novodoba-ceska-tradice-a-institucni-rozvoj': 'Novodobá česká tradice a institucionální rozvoj'
};
