import type { Priority, Severity, Ticket } from './types';

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;

/** Contractual resolution targets, by priority. */
export const SLA_TARGET: Record<Priority, number> = {
  critical: 1 * HOUR,
  high: 4 * HOUR,
  normal: 8 * HOUR,
  low: 24 * HOUR,
};

/**
 * How early we warn. 25% of the window, capped at 45 minutes.
 *
 * The cap is the important half. Without it a low-priority ticket (24h window)
 * shows as "at risk" with six hours left, and the urgent list fills with things
 * nobody has to act on now. A list that cries wolf gets ignored.
 */
export const warningWindow = (p: Priority) => Math.min(SLA_TARGET[p] * 0.25, 45 * MINUTE);

/**
 * The single source of truth for severity.
 *
 * Every component reads severity from here. The moment two components each decide
 * what "at risk" means, they disagree — which is how a dashboard drifts out of
 * consistency section by section.
 */
export function severityOf(ticket: Ticket, now: number): Severity {
  const remaining = ticket.deadline - now;
  if (remaining <= 0) return 'breached';
  if (remaining <= warningWindow(ticket.priority)) return 'risk';
  return 'ok';
}

export const SEVERITY_LABEL: Record<Severity, string> = {
  breached: 'Breached',
  risk: 'At risk',
  ok: 'On track',
};

/** Non-colour severity signal, so urgency never depends on hue alone. */
export const SEVERITY_GLYPH: Record<Severity, string> = {
  breached: '■',
  risk: '▲',
  ok: '●',
};

/** "38m 12s" under an hour, "3h 09m" above. Prefixed with + once overdue. */
export function formatRemaining(ms: number): string {
  const overdue = ms < 0;
  let seconds = Math.floor(Math.abs(ms) / 1000);
  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  const body = hours > 0 ? `${hours}h ${pad(minutes)}m` : `${pad(minutes)}m ${pad(seconds)}s`;
  return overdue ? `+${body}` : body;
}
