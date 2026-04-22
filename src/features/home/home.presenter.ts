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
    recommendedActionLabel: needsOnboarding ? 'Dokoncit prvni nastaveni' : getRecommendedActionLabel(recommendedReason),
    resumeAvailable,
    dueTodayCount,
    totalUnits,
    completionRatio,
    completionLabel:
      totalUnits > 0 ? `${Math.round(completionRatio * 100)} % upevnenych jednotek` : 'Pokrok se zacne pocitat po prvni relaci',
    highlightItems: buildHighlightItems(state, dueTodayCount),
    disciplineBars,
    weaknessItems,
    modeCards: [
      {
        id: 'atlas',
        title: 'Atlas souvislosti',
        description: 'Pro orientaci v oboru, trasach a vazbach mezi osobnostmi, pojmy a institucemi.',
        to: '/atlas'
      },
      {
        id: 'cases',
        title: 'Detektivni spisy',
        description: 'Pro delsi ulohy s indiciemi, syntezou a navratem k narocnejsim vazbam.',
        to: '/detektivni-spisy'
      },
      {
        id: 'lab',
        title: 'Laborator rozliseni',
        description: 'Pro rychle rozlisovani podobnych jmen, linii a castych zamen.',
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
      return 'Atlas souvislosti';
    case 'cases':
      return 'Detektivni spisy';
    case 'lab':
      return 'Laborator rozliseni';
  }
}

export function describeHomeCoverage(index?: ContentIndex): string {
  if (!index) {
    return 'Obsah aplikace se nacita.';
  }

  return `${index.people.size} osobnosti, ${index.concepts.size} pojmu a ${index.relations.size} vazeb pripravenych ke studiu.`;
}

function buildHighlightItems(state: AppStoreState, dueTodayCount: number): HomeHighlightItem[] {
  const preferredDisciplines = state.userProfile?.preferredDisciplineIds.length ?? 0;
  const resumeCount = state.resumeSession
    ? state.resumeSession.remainingTaskIds.length + (state.resumeSession.currentTaskId ? 1 : 0)
    : 0;

  return [
    {
      id: 'discipline-count',
      label: 'Preferovane discipliny',
      value: String(preferredDisciplines)
    },
    {
      id: 'resume-count',
      label: 'Rozpracovane kroky',
      value: String(resumeCount)
    },
    {
      id: 'review-count',
      label: 'Dnes k opakovani',
      value: String(dueTodayCount)
    }
  ];
}

function getRecommendedActionTitle(reason: ReturnType<typeof selectHomeRecommendedReason>, mode: StudyMode): string {
  switch (reason) {
    case 'first-run':
      return 'Zacni kratkym nastavenim vstupu';
    case 'resume':
      return 'Navazes presne tam, kde ses zastavil';
    case 'similar-person-confusion':
      return mode === 'lab'
        ? 'Nejvetsi prinos ted prinese Laborator rozliseni'
        : `Ted se vyplati pokracovat v rezimu ${resolveModeLabel(mode)}`;
    default:
      return `Muzes pokracovat v rezimu ${resolveModeLabel(mode)}`;
  }
}

function getRecommendedActionDescription(
  reason: ReturnType<typeof selectHomeRecommendedReason>,
  dueTodayCount: number
): string {
  switch (reason) {
    case 'first-run':
      return 'Vyberes si preferovane discipliny a nastavis denni intenzitu, aby doporuceni od zacatku davala smysl.';
    case 'resume':
      return 'Aplikace si pamatuje posledni relaci i nedokoncene kroky. Nemusis zacinat znovu.';
    case 'similar-person-confusion':
      return 'Historie zamen ukazuje, ze nejvetsi efekt prinese cilene rozlisovani podobnych osobnosti a vazeb.';
    default:
      return dueTodayCount > 0
        ? `Dnes uz ceka ${dueTodayCount} jednotek k opakovani, takze se vyplati navazat na prubezne upevnovani.`
        : 'Muzes si zvolit rezim podle toho, zda chces mapovat vztahy, resit pripad nebo rychle odlisovat podobna jmena.';
  }
}

function getRecommendedActionLabel(reason: ReturnType<typeof selectHomeRecommendedReason>): string {
  switch (reason) {
    case 'resume':
      return 'Pokracovat ve studiu';
    case 'similar-person-confusion':
      return 'Otevrit doporuceny rezim';
    default:
      return 'Zacit studijni blok';
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
  'specialni-pedagogika-a-dejiny-oboru': 'Specialni pedagogika a dejiny oboru',
  psychopedie: 'Psychopedie',
  somatopedie: 'Somatopedie',
  logopedie: 'Logopedie',
  surdopedie: 'Surdopedie',
  tyflopedie: 'Tyflopedie',
  etopedie: 'Etopedie',
  'diagnostika-a-psychometrie': 'Diagnostika a psychometrie',
  'psychologie-psychiatrie-a-psychoterapie': 'Psychologie, psychiatrie a psychoterapie',
  'andragogika-a-gerontagogika': 'Andragogika a gerontagogika',
  'novodoba-ceska-tradice-a-institucni-rozvoj': 'Novodoba ceska tradice a institucni rozvoj'
};
