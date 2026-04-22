import { FilterChip } from '@/components/shared/FilterChip';
import { SectionTitle } from '@/components/shared/SectionTitle';
import type { AtlasFilterOption } from '@/features/atlas/atlas.selectors';
import type { AtlasFiltersState } from '@/types/ui';

export interface AtlasFiltersProps {
  filters: AtlasFiltersState;
  disciplineOptions: AtlasFilterOption[];
  eraOptions: AtlasFilterOption[];
  relationTypeOptions: AtlasFilterOption[];
  tagOptions: AtlasFilterOption[];
  onToggleDiscipline: (id: string) => void;
  onToggleEra: (id: string) => void;
  onToggleRelationType: (id: string) => void;
  onToggleTag: (id: string) => void;
  onToggleWeakOnly: () => void;
  onReset: () => void;
}

export function AtlasFilters(props: AtlasFiltersProps) {
  return (
    <section className="panel stack gap-lg">
      <SectionTitle
        eyebrow="Práce s mapou"
        title="Filtry atlasu"
        subtitle="Vyber disciplíny, období a typy vztahů, které chceš právě teď sledovat."
        actions={
          <button className="button button-ghost" type="button" onClick={props.onReset}>
            Vyčistit filtry
          </button>
        }
        compact
      />

      <FilterRow
        title="Disciplíny"
        options={props.disciplineOptions}
        selectedIds={props.filters.disciplineIds}
        onToggle={props.onToggleDiscipline}
      />

      <FilterRow title="Období" options={props.eraOptions} selectedIds={props.filters.eraIds} onToggle={props.onToggleEra} />

      <FilterRow
        title="Typ vazby"
        options={props.relationTypeOptions}
        selectedIds={props.filters.relationTypes}
        onToggle={props.onToggleRelationType}
      />

      <FilterRow title="Štítky" options={props.tagOptions} selectedIds={props.filters.tagIds} onToggle={props.onToggleTag} />

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

function FilterRow(props: {
  title: string;
  options: AtlasFilterOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  if (props.options.length === 0) {
    return null;
  }

  return (
    <div className="stack gap-sm">
      <h3 className="subsection-title">{props.title}</h3>
      <div className="filter-chip-row">
        {props.options.map((option) => (
          <FilterChip
            key={option.id}
            label={option.label}
            count={option.count}
            selected={props.selectedIds.includes(option.id)}
            onClick={() => props.onToggle(option.id)}
          />
        ))}
      </div>
    </div>
  );
}
