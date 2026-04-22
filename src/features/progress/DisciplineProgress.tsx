import { DisciplineBars } from '@/components/charts/DisciplineBars';
import type { ProgressDisciplineSummary } from '@/features/progress/progress.selectors';

export interface DisciplineProgressProps {
  title: string;
  items: ProgressDisciplineSummary[];
}

export function DisciplineProgress({ title, items }: DisciplineProgressProps) {
  return (
    <DisciplineBars
      title={title}
      items={items.map((item) => ({
        id: item.id,
        label: item.label,
        value: item.mastered,
        total: Math.max(item.total, 1),
        subtitle: item.subtitle
      }))}
    />
  );
}
