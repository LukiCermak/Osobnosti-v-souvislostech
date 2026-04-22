import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  eyebrow?: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
  highlight?: boolean;
  as?: 'article' | 'section' | 'div';
}

export function Card({
  title,
  eyebrow,
  subtitle,
  footer,
  highlight = false,
  as = 'article',
  className,
  children,
  ...rest
}: CardProps) {
  const Element = as;
  const classes = ['panel', 'card', highlight ? 'panel-highlight' : '', className ?? ''].filter(Boolean).join(' ');

  return (
    <Element className={classes} {...rest}>
      {eyebrow || title || subtitle ? (
        <header className="stack gap-sm">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          {title ? <h2 className="section-title card-title">{title}</h2> : null}
          {subtitle ? <p className="text-body">{subtitle}</p> : null}
        </header>
      ) : null}
      {children ? <div className="stack gap-md">{children}</div> : null}
      {footer ? <footer className="card-footer">{footer}</footer> : null}
    </Element>
  );
}
