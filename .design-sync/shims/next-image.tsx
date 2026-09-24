// Stand-in for `next/image`: renders a plain <img>. Accepts both string srcs and
// static-import objects. Public-folder paths the components reference by string
// (tournament team logos) are resolved to bundled copies, since a design has no
// access to the app's /public directory.
import React from 'react';
import { falcon, leopard, oryx, wolves } from './team-logos';

export type StaticImageData = { src: string; height?: number; width?: number };

const PUBLIC_ASSETS: Record<string, string> = {
  '/teams/falcon.png': falcon,
  '/teams/leopard.png': leopard,
  '/teams/oryx.png': oryx,
  '/teams/wolves.png': wolves,
  '/teams/falcon.webp': falcon,
  '/teams/leopard.webp': leopard,
  '/teams/oryx.webp': oryx,
  '/teams/wolves.webp': wolves,
};

export interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | StaticImageData;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: string;
  blurDataURL?: string;
  unoptimized?: boolean;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(function Image(
  { src, fill, priority: _p, quality: _q, placeholder: _ph, blurDataURL: _b, unoptimized: _u, style, ...rest },
  ref,
) {
  const raw = typeof src === 'string' ? src : src.src;
  const resolved = PUBLIC_ASSETS[raw] ?? raw;
  const fillStyle: React.CSSProperties = fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%' }
    : {};
  return <img ref={ref} src={resolved} style={{ ...fillStyle, ...style }} {...rest} />;
});

export default Image;
