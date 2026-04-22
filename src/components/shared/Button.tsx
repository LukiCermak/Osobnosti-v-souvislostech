import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface CommonButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  className?: string;
}

type NativeButtonProps = CommonButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    to?: never;
    href?: never;
  };

type LinkButtonProps = CommonButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'> & {
    to: string;
    href?: never;
  };

type ExternalButtonProps = CommonButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & {
    href: string;
    to?: never;
  };

export type ButtonProps = NativeButtonProps | LinkButtonProps | ExternalButtonProps;

export function Button(props: ButtonProps) {
  const {
    children,
    variant = 'primary',
    size = 'md',
    block = false,
    leadingIcon,
    trailingIcon,
    className,
    ...rest
  } = props;

  const classes = [
    'button',
    `button-${variant}`,
    `button-size-${size}`,
    block ? 'button-block' : '',
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {leadingIcon ? <span className="button-icon" aria-hidden="true">{leadingIcon}</span> : null}
      <span>{children}</span>
      {trailingIcon ? <span className="button-icon" aria-hidden="true">{trailingIcon}</span> : null}
    </>
  );

  if ('to' in rest && typeof rest.to === 'string') {
    const { to, ...linkProps } = rest;
    return (
      <Link className={classes} to={to} {...linkProps}>
        {content}
      </Link>
    );
  }

  if ('href' in rest && typeof rest.href === 'string') {
    const { href, ...anchorProps } = rest;
    return (
      <a className={classes} href={href} {...anchorProps}>
        {content}
      </a>
    );
  }

  return (
    <button className={classes} type={rest.type ?? 'button'} {...rest}>
      {content}
    </button>
  );
}
