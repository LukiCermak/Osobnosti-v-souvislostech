import { ProgressRing } from '@/components/charts/ProgressRing';
import { Card } from '@/components/shared/Card';
import { ProgressBadge } from '@/components/shared/ProgressBadge';

export interface ProgressOverviewProps {
  title: string;
  subtitle: string;
  completionRatio: number;
  totalUnits: number;
  masteredUnits: number;
  unstableUnits: number;
  dueToday: number;
  latestSnapshotLabel: string;
}

export function ProgressOverview({
  title,
  subtitle,
  completionRatio,
  totalUnits,
  masteredUnits,
  unstableUnits,
  dueToday,
  latestSnapshotLabel
}: ProgressOverviewProps) {
  return (
    <Card as="section" eyebrow="Souhrn" title={title} subtitle={subtitle}>
      <div className="progress-overview-grid">
        <ProgressRing value={completionRatio} max={1} caption="Podíl upevněných jednotek" />
        <div className="stack gap-md">
          <div className="badge-row-wrap">
            <ProgressBadge tone="mastered" label="Upevněno" value={masteredUnits} />
            <ProgressBadge tone="needs-review" label="Dnes k opakování" value={dueToday} />
            <ProgressBadge tone="at-risk" label="Nestabilní" value={unstableUnits} />
            <ProgressBadge tone="growing" label="Celkem jednotek" value={totalUnits} />
          </div>
          <p className="text-body">Poslední přepočet pokroku: {latestSnapshotLabel}</p>
        </div>
      </div>
    </Card>
  );
}
