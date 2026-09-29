import type { ReactNode } from 'react';

/**
 * Primitives take a visual tone, never a domain concept. A Pill that knows what
 * "critical" means stops being reusable and starts duplicating domain rules.
 */
export type Tone = 'neutral' | 'danger' | 'warning' | 'accent' | 'success';

export function Pill({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className="pill" data-tone={tone}>{children}</span>;
}
