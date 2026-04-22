import { FilterChip } from '@/components/shared/FilterChip';
import type { DisciplineOption } from '@/features/onboarding/onboarding.presenter';

export interface DisciplinePickerProps {
  options: DisciplineOption[];
  selectedIds: string[];
  onToggle: (disciplineId: string) => void;
}

export function DisciplinePicker({ options, selectedIds, onToggle }: DisciplinePickerProps) {
  return (
    <section className="stack gap-md">
      <div className="discipline-picker-grid">
        {options.map((option) => {
          const selected = selectedIds.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              className={selected ? 'discipline-picker-card is-selected' : 'discipline-picker-card'}
              onClick={() => onToggle(option.id)}
            >
              <div className="stack gap-sm">
                <div className="discipline-picker-header">
                  <strong>{option.label}</strong>
                  <FilterChip label={selected ? 'Vybráno' : 'Vybrat'} selected={selected} />
                </div>
                <p className="text-body">{option.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
