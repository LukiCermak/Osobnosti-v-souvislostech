import { create } from 'zustand';
import type { AppRouteId, AtlasFiltersState, CaseUiState, LabUiState, ToastMessage, ThemeState } from '@/types/ui';

const THEME_STORAGE_KEY = 'ovs-theme-preference';

export interface UiStoreState {
  theme: ThemeState['theme'];
  sidebarOpen: boolean;
  atlasFilters: AtlasFiltersState;
  caseUiState: CaseUiState;
  labUiState: LabUiState;
  toasts: ToastMessage[];
  lastVisitedRoute?: AppRouteId;
  setTheme: (theme: ThemeState['theme']) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setLastVisitedRoute: (routeId: AppRouteId) => void;
  updateAtlasFilters: (patch: Partial<AtlasFiltersState>) => void;
  resetAtlasFilters: () => void;
  updateCaseUiState: (patch: Partial<CaseUiState>) => void;
  updateLabUiState: (patch: Partial<LabUiState>) => void;
  pushToast: (message: Omit<ToastMessage, 'id'>) => string;
  dismissToast: (id: string) => void;
}

export const defaultAtlasFilters: AtlasFiltersState = {
  disciplineIds: [],
  eraIds: [],
  relationTypes: [],
  tagIds: [],
  showOnlyWeakAreas: false
};

const defaultCaseUiState: CaseUiState = {
  expandedClueIds: [],
  revealedQuestionIds: [],
  showSynthesis: false
};

const defaultLabUiState: LabUiState = {
  preferredTempo: 'standard',
  showDifferenceHints: true
};

export const useUiStore = create<UiStoreState>((set) => ({
  theme: readStoredTheme(),
  sidebarOpen: false,
  atlasFilters: defaultAtlasFilters,
  caseUiState: defaultCaseUiState,
  labUiState: defaultLabUiState,
  toasts: [],

  setTheme(theme) {
    persistTheme(theme);
    set({ theme });
  },

  setSidebarOpen(sidebarOpen) {
    set({ sidebarOpen });
  },

  setLastVisitedRoute(lastVisitedRoute) {
    set({ lastVisitedRoute });
  },

  updateAtlasFilters(patch) {
    set((state) => ({
      atlasFilters: {
        ...state.atlasFilters,
        ...patch
      }
    }));
  },

  resetAtlasFilters() {
    set({ atlasFilters: defaultAtlasFilters });
  },

  updateCaseUiState(patch) {
    set((state) => ({
      caseUiState: {
        ...state.caseUiState,
        ...patch
      }
    }));
  },

  updateLabUiState(patch) {
    set((state) => ({
      labUiState: {
        ...state.labUiState,
        ...patch
      }
    }));
  },

  pushToast(message) {
    const id = `toast:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({
      toasts: [...state.toasts, { ...message, id }]
    }));
    return id;
  },

  dismissToast(id) {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }));
  }
}));

function readStoredTheme(): ThemeState['theme'] {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'dark';
}

function persistTheme(theme: ThemeState['theme']): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}
