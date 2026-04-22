import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';

export interface StorageSettingsProps {
  title: string;
  subtitle: string;
  statusLabel: string;
  usageLabel: string;
  warnings: string[];
  onRefresh: () => void;
  onReset: () => void;
}

export function StorageSettings({
  title,
  subtitle,
  statusLabel,
  usageLabel,
  warnings,
  onRefresh,
  onReset
}: StorageSettingsProps) {
  return (
    <Card as="section" eyebrow="Lokalni data" title={title} subtitle={subtitle}>
      <ul className="feature-list">
        <li>{`Stav uloziste: ${statusLabel}`}</li>
        <li>{`Vyuzita kapacita: ${usageLabel}`}</li>
      </ul>
      {warnings.length > 0 ? (
        <div className="stack gap-sm">
          {warnings.map((warning) => (
            <p className="text-body" key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}
      <div className="button-row">
        <Button variant="secondary" onClick={onRefresh}>Obnovit kontrolu</Button>
        <Button variant="danger" onClick={onReset}>Vymazat lokalni data</Button>
      </div>
    </Card>
  );
}
