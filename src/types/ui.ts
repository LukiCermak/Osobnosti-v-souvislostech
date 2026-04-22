import type { DisciplineId, EraId, RelationType, TagId } from '@/types/content';
import type { StudyMode } from '@/types/study';

export type AppRouteId =
  | 'home'
  | 'onboarding'
  | 'atlas'
  | 'cases'
  | 'lab'
  | 'progress'
  | 'review'
  | 'settings';

export interface NavigationItem {
  id: AppRouteId;
  path: string;
  label: string;
  mode?: StudyMode;
}

export interface AtlasFiltersState {
  disciplineIds: DisciplineId[];
  eraIds: EraId[];
  relationTypes: RelationType[];
  tagIds: TagId[];
  showOnlyWeakAreas: boolean;
}

export interface CaseUiState {
  expandedClueIds: string[];
  revealedQuestionIds: string[];
  showSynthesis: boolean;
}

export interface LabUiState {
  preferredTempo: 'slow' | 'standard' | 'fast';
  showDifferenceHints: boolean;
}

export interface ToastMessage {
  id: string;
  tone: 'informative' | 'success' | 'warning' | 'danger';
  title: string;
  description?: string;
}

export interface ModalState {
  id: string;
  isOpen: boolean;
}

export interface ThemeState {
  theme: 'system' | 'light' | 'dark';
}
