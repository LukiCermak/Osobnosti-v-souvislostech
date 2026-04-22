import type { CSSProperties } from 'react';
import { clamp } from '@/utils/numbers';

export interface WeaknessHeatmapCell {
  id: string;
  label: string;
  value: number;
  detail?: string;
}

export interface WeaknessHeatmapProps {
  title?: string;
  cells: WeaknessHeatmapCell[];
  columns?: number;
}

export function WeaknessHeatmap({ title, cells, columns = 4 }: WeaknessHeatmapProps) {
  return (
    <section className="panel stack gap-md">
      {title ? <h2 className="section-title">{title}</h2> : null}
      <div className="weakness-heatmap" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {cells.map((cell) => {
          const intensity = clamp(cell.value, 0, 1);
          return (
            <article
              key={cell.id}
              className="weakness-cell"
              style={{ '--weakness-intensity': intensity } as CSSProperties}
              title={cell.detail ?? cell.label}
            >
              <strong>{cell.label}</strong>
              {cell.detail ? <span className="text-body">{cell.detail}</span> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
