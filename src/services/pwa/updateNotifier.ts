import { useEffect } from 'react';
import { registerServiceWorker } from '@/services/pwa/registerServiceWorker';

export interface PwaNotifierMessages {
  updateTitle: string;
  updateText: string;
  updateAction: string;
  dismissAction: string;
  offlineReadyTitle: string;
  offlineReadyText: string;
  registrationError: string;
}

interface NotificationController {
  showUpdate: (applyUpdate: () => Promise<void>) => void;
  showOfflineReady: () => void;
  showRegistrationError: () => void;
  dispose: () => void;
}

export function usePwaUpdateNotifier(messages: PwaNotifierMessages) {
  useEffect(() => {
    const notifier = createUpdateNotifier(messages);
    registerServiceWorker({
      onOfflineReady: () => {
        notifier.showOfflineReady();
      },
      onUpdateAvailable: (applyUpdate) => {
        notifier.showUpdate(applyUpdate);
      },
      onRegistrationError: () => {
        notifier.showRegistrationError();
      }
    });

    return () => {
      notifier.dispose();
    };
  }, [messages]);
}

export function createUpdateNotifier(messages: PwaNotifierMessages): NotificationController {
  if (typeof document === 'undefined') {
    return {
      showUpdate: () => {},
      showOfflineReady: () => {},
      showRegistrationError: () => {},
      dispose: () => {}
    };
  }

  const container = document.createElement('div');
  container.setAttribute('data-pwa-notifier', 'true');
  Object.assign(container.style, {
    position: 'fixed',
    left: '16px',
    right: '16px',
    bottom: '16px',
    zIndex: '9999',
    display: 'grid',
    gap: '12px',
    pointerEvents: 'none'
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(container);

  const renderCard = (config: {
    title: string;
    text: string;
    primaryLabel?: string;
    onPrimary?: () => void;
    secondaryLabel?: string;
    onSecondary?: () => void;
    autoHideMs?: number;
  }) => {
    const card = document.createElement('section');
    Object.assign(card.style, {
      pointerEvents: 'auto',
      background: 'rgba(15, 23, 42, 0.96)',
      color: '#f8fafc',
      borderRadius: '20px',
      border: '1px solid rgba(148, 163, 184, 0.24)',
      boxShadow: '0 20px 50px rgba(15, 23, 42, 0.35)',
      padding: '16px',
      display: 'grid',
      gap: '10px'
    } satisfies Partial<CSSStyleDeclaration>);

    const title = document.createElement('strong');
    title.textContent = config.title;
    title.style.fontSize = '0.98rem';

    const text = document.createElement('p');
    text.textContent = config.text;
    Object.assign(text.style, {
      margin: '0',
      fontSize: '0.92rem',
      lineHeight: '1.45',
      color: 'rgba(226, 232, 240, 0.95)'
    } satisfies Partial<CSSStyleDeclaration>);

    const actions = document.createElement('div');
    Object.assign(actions.style, {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    } satisfies Partial<CSSStyleDeclaration>);

    const close = () => {
      window.clearTimeout(timeoutId);
      card.remove();
    };

    const createButton = (label: string, variant: 'primary' | 'secondary', handler?: () => void) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      Object.assign(button.style, {
        appearance: 'none',
        borderRadius: '999px',
        padding: '10px 14px',
        font: 'inherit',
        fontWeight: '700',
        cursor: 'pointer',
        border: variant === 'primary' ? 'none' : '1px solid rgba(148, 163, 184, 0.35)',
        background: variant === 'primary' ? '#5b6cf6' : 'transparent',
        color: '#f8fafc'
      } satisfies Partial<CSSStyleDeclaration>);
      button.addEventListener('click', () => {
        handler?.();
        close();
      });
      return button;
    };

    if (config.primaryLabel) {
      actions.appendChild(createButton(config.primaryLabel, 'primary', config.onPrimary));
    }

    if (config.secondaryLabel) {
      actions.appendChild(createButton(config.secondaryLabel, 'secondary', config.onSecondary));
    }

    card.append(title, text);
    if (actions.childElementCount > 0) {
      card.appendChild(actions);
    }
    container.appendChild(card);

    const timeoutId = window.setTimeout(() => {
      if (config.autoHideMs) {
        close();
      }
    }, config.autoHideMs ?? 0);
  };

  return {
    showUpdate(applyUpdate) {
      renderCard({
        title: messages.updateTitle,
        text: messages.updateText,
        primaryLabel: messages.updateAction,
        onPrimary: () => {
          void applyUpdate();
        },
        secondaryLabel: messages.dismissAction
      });
    },
    showOfflineReady() {
      renderCard({
        title: messages.offlineReadyTitle,
        text: messages.offlineReadyText,
        secondaryLabel: messages.dismissAction,
        autoHideMs: 7000
      });
    },
    showRegistrationError() {
      renderCard({
        title: messages.offlineReadyTitle,
        text: messages.registrationError,
        secondaryLabel: messages.dismissAction,
        autoHideMs: 9000
      });
    },
    dispose() {
      container.remove();
    }
  };
}
