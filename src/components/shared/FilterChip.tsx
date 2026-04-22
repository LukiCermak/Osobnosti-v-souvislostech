import type { ButtonHTMLAttributes } from 'react';

export interface FilterChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  selected?: boolean;
  count?: number;
}

export function FilterChip({ label, selected = false, count, className, type, ...rest }: FilterChipProps) {
  const classes = ['filter-chip', selected ? 'is-selected' : '', className ?? ''].filter(Boolean).join(' ');

  return (
    <button className={classes} type={type ?? 'button'} aria-pressed={selected} {...rest}>
      <span>{label}</span>
      {count !== undefined ? <span className="filter-chip-count">{count}</span> : null}
    </button>
  );
}
