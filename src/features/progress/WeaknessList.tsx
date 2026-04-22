import { Card } from '@/components/shared/Card';
import { ProgressBadge } from '@/components/shared/ProgressBadge';
import type { ProgressWeaknessSummary } from '@/features/progress/progress.selectors';

export interface WeaknessListProps {
  title: string;
  subtitle: string;
  items: ProgressWeaknessSummary[];
}

export function WeaknessList({ title, subtitle, items }: WeaknessListProps) {
  return (
    <Card as="section" eyebrow="Slabá místa" title={title} subtitle={subtitle}>
      <div className="stack gap-md">
        {items.map((item) => (
          <article key={item.id} className="weakness-list-item">
            <div className="section-title-row section-title-row-compact">
              <div className="stack gap-sm">
                <h3 className="subsection-title">{item.title}</h3>
                <p className="text-body">{item.detail}</p>
              </div>
              <ProgressBadge
                tone={item.urgency === 'high' ? 'at-risk' : item.urgency === 'medium' ? 'needs-review' : 'growing'}
                label="Naléhavost"
                value={item.urgency === 'high' ? 'Vysoká' : item.urgency === 'medium' ? 'Střední' : 'Nižší'}
              />
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}
