import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';

export interface StorageSettingsProps {
  title: string;
  subtitle: string;
  statusLabel: string;
  usageLabel: string;
  warnings: string[];
  onExport: () => void;
  onImportClick: () => void;
  onRefresh: () => void;
  onReset: () => void;
}

export function StorageSettings({
  title,
  subtitle,
  statusLabel,
  usageLabel,
  warnings,
  onExport,
  onImportClick,
  onRefresh,
  onReset
}: StorageSettingsProps) {
  return (
    <Card as="section" eyebrow="Lokální data" title={title} subtitle={subtitle}>
      <ul className="feature-list">
        <li>{`Stav úložiště: ${statusLabel}`}</li>
        <li>{`Využitá kapacita: ${usageLabel}`}</li>
      </ul>
      {warnings.length > 0 ? (
        <div className="stack gap-sm">
          {warnings.map((warning) => (
            <p className="text-body" key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}
      <div className="button-row">
        <Button onClick={onExport}>Exportovat progres</Button>
        <Button variant="secondary" onClick={onImportClick}>Importovat progres</Button>
        <Button variant="ghost" onClick={onRefresh}>Obnovit kontrolu</Button>
        <Button variant="danger" onClick={onReset}>Vymazat lokální data</Button>
      </div>
    </Card>
  );
}
