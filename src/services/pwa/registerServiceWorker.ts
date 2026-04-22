import { registerSW } from 'virtual:pwa-register';

export interface ServiceWorkerRegistrationOptions {
  onOfflineReady?: () => void;
  onUpdateAvailable?: (applyUpdate: () => Promise<void>) => void;
  onRegistrationError?: (error: unknown) => void;
}

let updateServiceWorker: ((reloadPage?: boolean) => Promise<void>) | null = null;
let registered = false;

export function registerServiceWorker(options: ServiceWorkerRegistrationOptions = {}) {
  if (registered || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return {
      applyUpdate: async () => {},
      isSupported: typeof window !== 'undefined' && 'serviceWorker' in navigator
    };
  }

  registered = true;

  updateServiceWorker = registerSW({
    immediate: true,
    onOfflineReady() {
      options.onOfflineReady?.();
    },
    onNeedRefresh() {
      options.onUpdateAvailable?.(applyServiceWorkerUpdate);
    },
    onRegisterError(error) {
      registered = false;
      options.onRegistrationError?.(error);
    }
  });

  return {
    applyUpdate: applyServiceWorkerUpdate,
    isSupported: true
  };
}

export async function applyServiceWorkerUpdate() {
  if (!updateServiceWorker) {
    return;
  }

  await updateServiceWorker(true);
}
