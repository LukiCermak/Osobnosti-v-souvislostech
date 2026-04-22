import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';

export interface PrivacySettingsProps {
  title: string;
  subtitle: string;
  localOnlyText: string;
  appearanceTitle: string;
  appearanceText: string;
  themeLabel: string;
  onToggleTheme: () => void;
}

export function PrivacySettings({
  title,
  subtitle,
  localOnlyText,
  appearanceTitle,
  appearanceText,
  themeLabel,
  onToggleTheme
}: PrivacySettingsProps) {
  return (
    <div className="grid grid-2 settings-grid">
      <Card as="section" eyebrow="Soukromi" title={title} subtitle={subtitle}>
        <p className="text-body">{localOnlyText}</p>
      </Card>
      <Card as="section" eyebrow="Vzhled" title={appearanceTitle} subtitle={appearanceText}>
        <div className="button-row">
          <Button variant="secondary" onClick={onToggleTheme}>{themeLabel}</Button>
        </div>
      </Card>
    </div>
  );
}
