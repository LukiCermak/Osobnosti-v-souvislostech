import {
  checkStorageHealth,
  type StorageHealthReport
} from '@/services/storage/storageHealth';

export interface QuotaMonitorOptions {
  intervalMs?: number;
  onChange?: (report: StorageHealthReport) => void;
}

export interface QuotaMonitorHandle {
  stop: () => void;
  refresh: () => Promise<StorageHealthReport>;
}

const DEFAULT_INTERVAL_MS = 2 * 60 * 1000;

export function startQuotaMonitor(options: QuotaMonitorOptions = {}): QuotaMonitorHandle {
  let timerId: number | undefined;
  let lastSignature = '';

  const emit = async (): Promise<StorageHealthReport> => {
    const report = await checkStorageHealth();
    const signature = `${report.status}:${report.estimate.usageRatio ?? 'na'}:${report.database.lastError ?? ''}`;

    if (signature !== lastSignature) {
      lastSignature = signature;
      options.onChange?.(report);
    }

    return report;
  };

  if (typeof window !== 'undefined') {
    timerId = window.setInterval(() => {
      void emit();
    }, options.intervalMs ?? DEFAULT_INTERVAL_MS);
  }

  return {
    stop: () => {
      if (timerId !== undefined && typeof window !== 'undefined') {
        window.clearInterval(timerId);
      }
    },
    refresh: emit
  };
}
