import { Card } from '@/components/shared/Card';
import type { ModeIntroItem } from '@/features/onboarding/onboarding.presenter';

export interface ModeIntroProps {
  items: ModeIntroItem[];
}

export function ModeIntro({ items }: ModeIntroProps) {
  return (
    <div className="grid grid-3">
      {items.map((item) => (
        <Card key={item.id} as="article" eyebrow={item.title} title={item.title} subtitle={item.description}>
          <p className="text-body">{item.whenToUse}</p>
        </Card>
      ))}
    </div>
  );
}
