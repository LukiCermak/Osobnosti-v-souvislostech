import { getDatabaseHealth } from '@/db/database';

export type StorageHealthStatus = 'good' | 'warning' | 'critical' | 'unavailable';

export interface StorageEstimateSnapshot {
  quota?: number;
  usage?: number;
  usageRatio?: number;
  persisted?: boolean;
}

export interface StorageHealthReport {
  status: StorageHealthStatus;
  indexedDbAvailable: boolean;
  database: Awaited<ReturnType<typeof getDatabaseHealth>>;
  estimate: StorageEstimateSnapshot;
  checkedAt: string;
  warnings: string[];
}

const WARNING_RATIO = 0.8;
const CRITICAL_RATIO = 0.92;

export async function checkStorageHealth(): Promise<StorageHealthReport> {
  const checkedAt = new Date().toISOString();
  const database = await getDatabaseHealth();
  const estimate = await readStorageEstimate();
  const warnings: string[] = [];

  if (!database.isOpen && database.lastError) {
    warnings.push(database.lastError);
  }

  if (estimate.usageRatio !== undefined) {
    if (estimate.usageRatio >= CRITICAL_RATIO) {
      warnings.push('Lokální úložiště je téměř zaplněné.');
    } else if (estimate.usageRatio >= WARNING_RATIO) {
      warnings.push('Lokální úložiště se blíží kapacitě zařízení.');
    }
  }

  const status = resolveStorageStatus(database.isOpen, estimate.usageRatio);

  return {
    status,
    indexedDbAvailable: database.isOpen,
    database,
    estimate,
    checkedAt,
    warnings
  };
}

export function formatStorageUsage(estimate: StorageEstimateSnapshot): string {
  if (estimate.usage === undefined || estimate.quota === undefined) {
    return '';
  }

  return `${formatBytes(estimate.usage)} z ${formatBytes(estimate.quota)}`;
}

export function getStorageStatusKey(status: StorageHealthStatus): string {
  switch (status) {
    case 'good':
      return 'common.status.storageGood';
    case 'warning':
      return 'common.status.storageWarning';
    case 'critical':
      return 'common.status.storageCritical';
    case 'unavailable':
      return 'common.status.storageUnavailable';
  }
}

async function readStorageEstimate(): Promise<StorageEstimateSnapshot> {
  if (typeof navigator === 'undefined' || !('storage' in navigator)) {
    return {};
  }

  const storageManager = navigator.storage as StorageManager;
  const [estimate, persisted] = await Promise.all([
    storageManager.estimate?.(),
    storageManager.persisted?.().catch(() => undefined)
  ]);

  const quota = typeof estimate?.quota === 'number' ? estimate.quota : undefined;
  const usage = typeof estimate?.usage === 'number' ? estimate.usage : undefined;
  const usageRatio = quota && usage ? usage / quota : undefined;

  return {
    quota,
    usage,
    usageRatio,
    persisted
  };
}

function resolveStorageStatus(isAvailable: boolean, usageRatio?: number): StorageHealthStatus {
  if (!isAvailable) {
    return 'unavailable';
  }

  if (usageRatio === undefined) {
    return 'good';
  }

  if (usageRatio >= CRITICAL_RATIO) {
    return 'critical';
  }

  if (usageRatio >= WARNING_RATIO) {
    return 'warning';
  }

  return 'good';
}

function formatBytes(value: number): string {
  if (value < 1024) {
    return `${value} B`;
  }

  const units = ['KB', 'MB', 'GB', 'TB'];
  let current = value / 1024;
  let unitIndex = 0;

  while (current >= 1024 && unitIndex < units.length - 1) {
    current /= 1024;
    unitIndex += 1;
  }

  return `${current.toFixed(current >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}
