import type { UserProfile } from '@/types/progress';

export interface DisciplineOption {
  id: string;
  label: string;
  description: string;
}

export interface ModeIntroItem {
  id: 'atlas' | 'cases' | 'lab';
  title: string;
  description: string;
  whenToUse: string;
}

export interface OnboardingDraft {
  preferredDisciplineIds: string[];
  preferredDailyIntensity: UserProfile['preferredDailyIntensity'];
}

export interface OnboardingViewModel {
  draft: OnboardingDraft;
  availableDisciplines: DisciplineOption[];
  modes: ModeIntroItem[];
  canSubmit: boolean;
}

export function createInitialOnboardingDraft(profile?: UserProfile): OnboardingDraft {
  return {
    preferredDisciplineIds: profile?.preferredDisciplineIds ?? [],
    preferredDailyIntensity: profile?.preferredDailyIntensity ?? 'standard'
  };
}

export function createOnboardingViewModel(input: { profile?: UserProfile; draft: OnboardingDraft }): OnboardingViewModel {
  return {
    draft: input.draft,
    availableDisciplines: disciplineOptions,
    modes: [
      {
        id: 'atlas',
        title: 'Atlas souvislostí',
        description: 'Vhodný pro první orientaci v oboru, trasách a vztazích mezi osobnostmi, pojmy a institucemi.',
        whenToUse: 'Když si chceš vytvořit přehled a hledat návaznosti.'
      },
      {
        id: 'cases',
        title: 'Detektivní spisy',
        description: 'Vhodné pro pomalejší odhalování souvislostí přes indicie, otázky a závěrečnou syntézu.',
        whenToUse: 'Když chceš jít do hloubky a procvičit odvozování.'
      },
      {
        id: 'lab',
        title: 'Laboratoř rozlišení',
        description: 'Vhodná pro rychlé rozlišování podobných osobností, pojmů a historických linií.',
        whenToUse: 'Když se vracíš ke záměnám a chceš upevnit slabá místa.'
      }
    ],
    canSubmit: input.draft.preferredDisciplineIds.length > 0
  };
}

export function toggleDisciplineSelection(currentIds: string[], disciplineId: string): string[] {
  return currentIds.includes(disciplineId)
    ? currentIds.filter((id) => id !== disciplineId)
    : [...currentIds, disciplineId];
}

const disciplineOptions: DisciplineOption[] = [
  {
    id: 'specialni-pedagogika-a-dejiny-oboru',
    label: 'Speciální pedagogika a dějiny oboru',
    description: 'Vymezení oboru, klíčové definice a historické proměny.'
  },
  {
    id: 'psychopedie',
    label: 'Psychopedie',
    description: 'Osobnosti a přístupy spojené s edukací osob s mentálním postižením.'
  },
  {
    id: 'somatopedie',
    label: 'Somatopedie',
    description: 'Edukace, rehabilitace a podpora osob s tělesným postižením.'
  },
  {
    id: 'logopedie',
    label: 'Logopedie',
    description: 'Řeč, hlas, komunikace a podpůrné komunikační systémy.'
  },
  {
    id: 'surdopedie',
    label: 'Surdopedie',
    description: 'Vzdělávání neslyšících a metodické linie práce se sluchem a řečí.'
  },
  {
    id: 'tyflopedie',
    label: 'Tyflopedie',
    description: 'Historie a současnost edukace osob se zrakovým postižením.'
  },
  {
    id: 'etopedie',
    label: 'Etopedie',
    description: 'Reedukace, náprava chování a sociálně-výchovné přístupy.'
  },
  {
    id: 'diagnostika-a-psychometrie',
    label: 'Diagnostika a psychometrie',
    description: 'Škály, testy a diagnostické linie důležité pro studium oboru.'
  },
  {
    id: 'psychologie-psychiatrie-a-psychoterapie',
    label: 'Psychologie, psychiatrie a psychoterapie',
    description: 'Širší psychologické a terapeutické zázemí speciální pedagogiky.'
  },
  {
    id: 'andragogika-a-gerontagogika',
    label: 'Andragogika a gerontagogika',
    description: 'Vzdělávání dospělých a seniorů včetně speciálněpedagogických přesahů.'
  },
  {
    id: 'novodoba-ceska-tradice-a-institucni-rozvoj',
    label: 'Novodobá česká tradice a institucionální rozvoj',
    description: 'Současné české osobnosti, instituce a podpůrné iniciativy.'
  }
];
