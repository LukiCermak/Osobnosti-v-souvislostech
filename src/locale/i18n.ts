import {
  createContext,
  createElement,
  useContext,
  useMemo,
  type PropsWithChildren,
  type ReactNode
} from 'react';
import common from '@/locale/cs/common.json';
import home from '@/locale/cs/home.json';
import atlas from '@/locale/cs/atlas.json';
import cases from '@/locale/cs/cases.json';
import lab from '@/locale/cs/lab.json';
import progress from '@/locale/cs/progress.json';
import review from '@/locale/cs/review.json';
import onboarding from '@/locale/cs/onboarding.json';
import settings from '@/locale/cs/settings.json';
import {
  isMessageTree,
  resolveMessage,
  type MessageLeaf,
  type MessageTree,
  type ResolveMessageOptions
} from '@/locale/messageResolver';

export type SupportedLocale = 'cs';
export type LocaleNamespace =
  | 'common'
  | 'home'
  | 'atlas'
  | 'cases'
  | 'lab'
  | 'progress'
  | 'review'
  | 'onboarding'
  | 'settings';

export const localeRegistry = {
  cs: {
    common,
    home,
    atlas,
    cases,
    lab,
    progress,
    review,
    onboarding,
    settings
  }
} satisfies Record<SupportedLocale, Record<LocaleNamespace, MessageTree>>;

export interface I18nContextValue {
  locale: SupportedLocale;
  t: (key: string, options?: ResolveMessageOptions) => MessageLeaf;
  tString: (key: string, options?: ResolveMessageOptions) => string;
  tList: (key: string, options?: ResolveMessageOptions) => string[];
  namespace: (name: LocaleNamespace) => MessageTree;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: PropsWithChildren): ReactNode {
  const locale: SupportedLocale = 'cs';

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: string, options?: ResolveMessageOptions): MessageLeaf => translate(locale, key, options);
    const tString = (key: string, options?: ResolveMessageOptions): string => {
      const resolved = t(key, options);
      return Array.isArray(resolved) ? resolved.join(' ') : resolved;
    };
    const tList = (key: string, options?: ResolveMessageOptions): string[] => {
      const resolved = t(key, options);
      return Array.isArray(resolved) ? resolved : [resolved];
    };

    return {
      locale,
      t,
      tString,
      tList,
      namespace: (name: LocaleNamespace) => localeRegistry[locale][name]
    };
  }, [locale]);

  return createElement(I18nContext.Provider, { value }, children);
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n musí být použito uvnitř I18nProvideru.');
  }

  return context;
}

export function translate(
  locale: SupportedLocale,
  key: string,
  options?: ResolveMessageOptions
): MessageLeaf {
  const [namespace, ...segments] = key.split('.');
  const tree = localeRegistry[locale][namespace as LocaleNamespace];

  if (!tree || !isMessageTree(tree)) {
    return options?.fallback ?? key;
  }

  return resolveMessage(tree, segments.join('.'), options);
}

export function translateString(
  locale: SupportedLocale,
  key: string,
  options?: ResolveMessageOptions
): string {
  const resolved = translate(locale, key, options);
  return Array.isArray(resolved) ? resolved.join(' ') : resolved;
}
