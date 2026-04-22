import { Card } from '@/components/shared/Card';
import { ProgressBadge } from '@/components/shared/ProgressBadge';
import type { ReviewQueueItemViewModel } from '@/features/review/review.presenter';

export interface DueTodayListProps {
  title: string;
  subtitle: string;
  items: ReviewQueueItemViewModel[];
}

export function DueTodayList({ title, subtitle, items }: DueTodayListProps) {
  return (
    <Card as="section" eyebrow="Fronta" title={title} subtitle={subtitle}>
      <div className="stack gap-md">
        {items.map((item) => (
          <article key={item.id} className="review-queue-item">
            <div className="section-title-row section-title-row-compact">
              <div className="stack gap-sm">
                <h3 className="subsection-title">{item.title}</h3>
                <p className="text-body">{item.subtitle}</p>
                <p className="text-body">Termín opakování: {item.dueLabel}</p>
              </div>
              <ProgressBadge tone="needs-review" label="Doporučený režim" value={modeLabel(item.recommendedMode)} />
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}

function modeLabel(mode: ReviewQueueItemViewModel['recommendedMode']): string {
  switch (mode) {
    case 'atlas':
      return 'Atlas';
    case 'cases':
      return 'Spisy';
    case 'lab':
      return 'Laboratoř';
  }
}
