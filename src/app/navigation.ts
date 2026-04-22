import type { I18nContextValue } from '@/locale/i18n';
import type { NavigationItem } from '@/types/ui';

export function createNavigationItems(
  tString: I18nContextValue['tString']
): NavigationItem[] {
  return [
    { id: 'home', path: '/', label: tString('common.navigation.home') },
    {
      id: 'atlas',
      path: '/atlas',
      label: tString('common.navigation.modes'),
      children: [
        { id: 'atlas', path: '/atlas', label: tString('common.navigation.atlas'), mode: 'atlas' },
        { id: 'cases', path: '/detektivni-spisy', label: tString('common.navigation.cases'), mode: 'cases' },
        { id: 'lab', path: '/laborator-rozliseni', label: tString('common.navigation.lab'), mode: 'lab' }
      ]
    },
    { id: 'progress', path: '/pokrok', label: tString('common.navigation.progress') }
  ];
}
