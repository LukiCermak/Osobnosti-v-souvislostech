const FULL_DATE_FORMATTER = new Intl.DateTimeFormat('cs-CZ', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('cs-CZ', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

export function toDate(value: string | Date | number): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatDate(value: string | Date | number): string {
  return FULL_DATE_FORMATTER.format(toDate(value));
}

export function formatDateTime(value: string | Date | number): string {
  return DATE_TIME_FORMATTER.format(toDate(value));
}

export function isPastDue(value?: string | Date | number): boolean {
  if (!value) {
    return false;
  }

  return toDate(value).getTime() < Date.now();
}

export function daysBetween(from: string | Date | number, to: string | Date | number): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round((toDate(to).getTime() - toDate(from).getTime()) / millisecondsPerDay);
}

export function formatRelativeDate(value: string | Date | number, reference: string | Date | number = Date.now()): string {
  const diffDays = daysBetween(reference, value);

  if (diffDays === 0) {
    return 'dnes';
  }

  if (diffDays === 1) {
    return 'zítra';
  }

  if (diffDays === -1) {
    return 'včera';
  }

  if (diffDays > 1 && diffDays < 5) {
    return `za ${diffDays} dny`;
  }

  if (diffDays >= 5) {
    return `za ${diffDays} dní`;
  }

  if (diffDays === -2 || diffDays === -3 || diffDays === -4) {
    return `před ${Math.abs(diffDays)} dny`;
  }

  return `před ${Math.abs(diffDays)} dny`;
}
