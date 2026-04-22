import { clamp, formatPercentage } from '@/utils/numbers';

export interface DisciplineBarDatum {
  id: string;
  label: string;
  value: number;
  total?: number;
  subtitle?: string;
}

export interface DisciplineBarsProps {
  title?: string;
  items: DisciplineBarDatum[];
}

export function DisciplineBars({ title, items }: DisciplineBarsProps) {
  return (
    <section className="panel stack gap-md">
      {title ? <h2 className="section-title">{title}</h2> : null}
      <div className="stack gap-md">
        {items.map((item) => {
          const ratio = item.total && item.total > 0 ? clamp(item.value / item.total, 0, 1) : clamp(item.value, 0, 1);
          return (
            <div className="stack gap-sm" key={item.id}>
              <div className="discipline-bar-header">
                <div>
                  <strong>{item.label}</strong>
                  {item.subtitle ? <p className="text-body">{item.subtitle}</p> : null}
                </div>
                <span className="text-body">{formatPercentage(ratio)}</span>
              </div>
              <div className="discipline-bar-track" aria-hidden="true">
                <div className="discipline-bar-value" style={{ width: `${ratio * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
