import type { LabTask } from '@/types/study';

export interface QuickChoiceProps {
  task: LabTask;
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
}

export function QuickChoice({ task, selectedOptionId, onSelect }: QuickChoiceProps) {
  return (
    <div className="lab-choice-grid">
      {task.options.map((option, index) => (
        <button
          key={option.id}
          type="button"
          className={[
            'lab-choice-button',
            selectedOptionId === option.id ? 'is-selected' : ''
          ].filter(Boolean).join(' ')}
          onClick={() => onSelect(option.id)}
        >
          <span className="lab-choice-index">{index + 1}</span>
          <span className="lab-choice-label">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
