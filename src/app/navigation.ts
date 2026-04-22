import type { I18nContextValue } from '@/locale/i18n';
import type { NavigationItem } from '@/types/ui';

interface NavigationOptions {
  includeOnboarding?: boolean;
  includeReview?: boolean;
  includeSettings?: boolean;
}

export function createNavigationItems(
  tString: I18nContextValue['tString'],
  options: NavigationOptions = {}
): NavigationItem[] {
  const items: NavigationItem[] = [
    { id: 'home', path: '/', label: tString('common.navigation.home') },
    { id: 'atlas', path: '/atlas', label: tString('common.navigation.atlas'), mode: 'atlas' },
    { id: 'cases', path: '/detektivni-spisy', label: tString('common.navigation.cases'), mode: 'cases' },
    { id: 'lab', path: '/laborator-rozliseni', label: tString('common.navigation.lab'), mode: 'lab' },
    { id: 'progress', path: '/pokrok', label: tString('common.navigation.progress') }
  ];

  if (options.includeReview) {
    items.push({ id: 'review', path: '/opakovani', label: tString('common.navigation.review') });
  }

  if (options.includeSettings) {
    items.push({ id: 'settings', path: '/nastaveni', label: tString('common.navigation.settings') });
  }

  if (options.includeOnboarding) {
    items.push({ id: 'onboarding', path: '/prvni-nastaveni', label: tString('common.navigation.onboarding') });
  }

  return items;
}
