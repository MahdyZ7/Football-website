// Stand-in for `next/link`: a plain <a> that routes through the sandbox router
// instead of leaving the page.
import React, { useContext } from 'react';
import { SandboxRouterContext } from './router-context';

type Href = string | { pathname?: string; query?: Record<string, string> };

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: Href;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  legacyBehavior?: boolean;
}

function toHref(href: Href): string {
  if (typeof href === 'string') return href;
  const qs = href.query ? `?${new URLSearchParams(href.query)}` : '';
  return `${href.pathname ?? ''}${qs}`;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, prefetch: _p, replace: _r, scroll: _s, shallow: _sh, passHref: _ph, legacyBehavior: _lb, onClick, children, ...rest },
  ref,
) {
  const { navigate } = useContext(SandboxRouterContext);
  const url = toHref(href);
  const external = /^[a-z]+:/i.test(url) || rest.target === '_blank';
  return (
    <a
      ref={ref}
      href={url}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || external) return;
        e.preventDefault();
        navigate(url);
      }}
      {...rest}
    >
      {children}
    </a>
  );
});

export default Link;
