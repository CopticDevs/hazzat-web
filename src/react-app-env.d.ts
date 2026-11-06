/// <reference types="node" />
/// <reference types="react" />

declare module '*.svg' {
  import type { FunctionComponent, SVGProps } from 'react';
  export const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string }>;
  const url: string;
  export default url;
}
declare module '*.png' { const url: string; export default url; }
declare module '*.jpg' { const url: string; export default url; }
declare module '*.jpeg' { const url: string; export default url; }
declare module '*.gif' { const url: string; export default url; }
declare module '*.webp' { const url: string; export default url; }
declare module '*.avif' { const url: string; export default url; }
declare module '*.bmp' { const url: string; export default url; }
declare module '*.module.css' { const classes: Record<string, string>; export default classes; }
