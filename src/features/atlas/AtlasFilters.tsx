import { useMemo } from 'react';
import { FilterChip } from '@/components/shared/FilterChip';
import { SectionTitle } from '@/components/shared/SectionTitle';
import type { AtlasFilterOption } from '@/features/atlas/atlas.selectors';
import type { AtlasFiltersState } from '@/types/ui';

export interface AtlasFiltersProps {
  filters: AtlasFiltersState;
  disciplineOptions: AtlasFilterOption[];
  eraOptions: AtlasFilterOption[];
  tagOptions: AtlasFilterOption[];
  onToggleDiscipline: (id: string) => void;
  onSetEraRange: (eraIds: string[]) => void;
  onToggleTag: (id: string) => void;
  onToggleWeakOnly: () => void;
  onReset: () => void;
}

export function AtlasFilters(props: AtlasFiltersProps) {
  const orderedEras = useMemo(
    () =>
      [...props.eraOptions].sort(
        (left, right) => (left.sortKey ?? Number.MAX_SAFE_INTEGER) - (right.sortKey ?? Number.MAX_SAFE_INTEGER)
      ),
    [props.eraOptions]
  );

  const selectedEraIndexes = orderedEras
    .map((option, index) => (props.filters.eraIds.includes(option.id) ? index : -1))
    .filter((index) => index >= 0);

  const rangeStart = selectedEraIndexes.length > 0 ? Math.min(...selectedEraIndexes) : 0;
  const rangeEnd = selectedEraIndexes.length > 0 ? Math.max(...selectedEraIndexes) : Math.max(orderedEras.length - 1, 0);
  const rangeStartOption = orderedEras[rangeStart];
  const rangeEndOption = orderedEras[rangeEnd];

  const handleRangeChange = (startIndex: number, endIndex: number) => {
    const safeStart = Math.max(0, Math.min(startIndex, endIndex));
    const safeEnd = Math.max(safeStart, Math.max(startIndex, endIndex));
    const nextEraIds = orderedEras.slice(safeStart, safeEnd + 1).map((option) => option.id);
    props.onSetEraRange(nextEraIds);
  };

  return (
    <section className="panel stack gap-lg">
      <SectionTitle
        eyebrow="Práce s mapou"
        title="Nastavení atlasu"
        subtitle="Vyber disciplíny, časový rozsah a jen opravdu užitečné štítky. Atlas má být rychle čitelný, ne zahlcený."
        actions={
          <button className="button button-ghost" type="button" onClick={props.onReset}>
            Vyčistit filtry
          </button>
        }
        compact
      />

      <div className="stack gap-sm">
        <h3 className="subsection-title">Disciplíny</h3>
        <div className="atlas-discipline-grid">
          {props.disciplineOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={['atlas-discipline-button', props.filters.disciplineIds.includes(option.id) ? 'is-selected' : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => props.onToggleDiscipline(option.id)}
            >
              <span className="atlas-discipline-label">{option.label}</span>
              <span className="atlas-discipline-count">{option.count}</span>
            </button>
          ))}
        </div>
      </div>

      {orderedEras.length > 0 ? (
        <div className="stack gap-sm">
          <h3 className="subsection-title">Časová osa</h3>
          <p className="text-body">
            {rangeStartOption && rangeEndOption
              ? `${rangeStartOption.label} až ${rangeEndOption.label}`
              : 'Vyber období posunutím obou jezdců.'}
          </p>
          <div className="atlas-era-range">
            <input
              type="range"
              min={0}
              max={Math.max(orderedEras.length - 1, 0)}
              value={rangeStart}
              onChange={(event) => handleRangeChange(Number(event.currentTarget.value), rangeEnd)}
            />
            <input
              type="range"
              min={0}
              max={Math.max(orderedEras.length - 1, 0)}
              value={rangeEnd}
              onChange={(event) => handleRangeChange(rangeStart, Number(event.currentTarget.value))}
            />
          </div>
        </div>
      ) : null}

      <div className="stack gap-sm">
        <h3 className="subsection-title">Štítky</h3>
        <div className="filter-chip-row">
          {props.tagOptions.map((option) => (
            <FilterChip
              key={option.id}
              label={option.label}
              count={option.count}
              selected={props.filters.tagIds.includes(option.id)}
              onClick={() => props.onToggleTag(option.id)}
            />
          ))}
        </div>
      </div>

      <div className="atlas-weak-toggle-row">
        <FilterChip
          label="Ukázat hlavně slabá místa"
          selected={props.filters.showOnlyWeakAreas}
          onClick={props.onToggleWeakOnly}
        />
      </div>
    </section>
  );
}
