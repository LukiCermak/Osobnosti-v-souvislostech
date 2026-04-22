export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function slugify(value: string): string {
  return normalizeWhitespace(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function joinLabels(values: readonly string[], fallback = '—'): string {
  return values.length > 0 ? values.join(', ') : fallback;
}

export function toInitials(value: string, limit = 2): string {
  const parts = normalizeWhitespace(value).split(' ').filter(Boolean).slice(0, limit);
  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

export function containsText(haystack: string, needle: string): boolean {
  return normalizeWhitespace(haystack).toLocaleLowerCase('cs').includes(normalizeWhitespace(needle).toLocaleLowerCase('cs'));
}
