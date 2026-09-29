import { useNow } from '../../hooks/useTicker';
import { formatRemaining, severityOf, SEVERITY_GLYPH } from '../../lib/sla';
import type { Ticket } from '../../lib/types';

/**
 * The only component that re-renders on the tick.
 *
 * It subscribes to the shared clock; its parent row does not. That is what keeps a
 * long list cheap — the row is memoised and only this leaf updates each second.
 */
export function SlaCountdown({ ticket }: { ticket: Ticket }) {
  const now = useNow();
  const severity = severityOf(ticket, now);
  const remaining = ticket.deadline - now;

  return (
    <span className="sla mono" data-severity={severity}>
      <span className="glyph" aria-hidden="true">{SEVERITY_GLYPH[severity]}</span>
      <span>
        <span>{formatRemaining(remaining)}</span>
        <span className="slalabel">{severity === 'breached' ? 'Overdue' : 'Left'}</span>
      </span>
    </span>
  );
}
