import type { HTMLAttributes, ReactNode } from 'react';
import { SectionTitle } from '@/components/shared/SectionTitle';

export interface ContentFrameProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
}

export function ContentFrame({ title, subtitle, eyebrow, actions, children, className, ...rest }: ContentFrameProps) {
  return (
    <section className={['content-frame', 'stack', 'gap-lg', className ?? ''].filter(Boolean).join(' ')} {...rest}>
      {title ? <SectionTitle title={title} subtitle={subtitle} eyebrow={eyebrow} actions={actions} /> : null}
      {children}
    </section>
  );
}
