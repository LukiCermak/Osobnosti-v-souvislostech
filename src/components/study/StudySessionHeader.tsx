import { ProgressRing } from '@/components/charts/ProgressRing';
import { ProgressBadge } from '@/components/shared/ProgressBadge';
import type { StudyMode } from '@/types/study';

export interface StudySessionHeaderProps {
  mode: StudyMode;
  title: string;
  completedCount: number;
  totalCount: number;
  remainingCount: number;
}

export function StudySessionHeader({ mode, title, completedCount, totalCount, remainingCount }: StudySessionHeaderProps) {
  return (
    <section className="panel study-session-header">
      <div className="study-session-header-main">
        <div className="stack gap-sm">
          <p className="eyebrow">{mapModeLabel(mode)}</p>
          <h1 className="section-title">{title}</h1>
          <div className="feedback-header">
            <ProgressBadge label="hotovo" value={completedCount} tone="mastered" />
            <ProgressBadge label="zbývá" value={remainingCount} tone="needs-review" />
          </div>
        </div>
        <ProgressRing value={completedCount} max={Math.max(totalCount, 1)} caption={`Zpracováno ${completedCount} z ${totalCount}`} />
      </div>
    </section>
  );
}

function mapModeLabel(mode: StudyMode): string {
  switch (mode) {
    case 'atlas':
      return 'Atlas souvislostí';
    case 'cases':
      return 'Detektivní spisy';
    case 'lab':
      return 'Laboratoř rozlišení';
  }
}
