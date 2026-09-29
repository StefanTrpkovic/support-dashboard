import { memo } from 'react';
import { Pill } from '../primitives/Pill';
import { SlaCountdown } from './SlaCountdown';
import type { Severity, Ticket } from '../../lib/types';

interface Props {
  ticket: Ticket;
  /** Severity at the moment the list was sorted — the row's stripe and tint come from this. */
  severity: Severity;
  onOpen: (ticket: Ticket) => void;
  onAction: (ticket: Ticket, kind: 'escalate' | 'reassign' | 'review') => void;
}

const PRIORITY_TONE = { critical: 'danger', high: 'warning', normal: 'neutral', low: 'neutral' } as const;

/**
 * Memoised, so a tick does not touch it. Only SlaCountdown inside re-renders.
 */
export const TicketRow = memo(function TicketRow({ ticket, severity, onOpen, onAction }: Props) {
  return (
    <div
      className="row"
      data-severity={severity}
      role="button"
      tabIndex={0}
      aria-label={`${ticket.id}: ${ticket.subject}`}
      onClick={(e) => { if (!(e.target as HTMLElement).closest('.mini')) onOpen(ticket); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(ticket); } }}
    >
      <span className="stripe" aria-hidden="true" />
      <span className="tid mono">{ticket.id}</span>
      <span className="subject">
        <span className="t">{ticket.subject}</span>
        <span className="m">{ticket.customer} · {ticket.region} · {ticket.channel}</span>
      </span>
      <SlaCountdown ticket={ticket} />
      <span className="col-priority"><Pill tone={PRIORITY_TONE[ticket.priority]}>{ticket.priority}</Pill></span>
      <span className="col-status">
        <Pill tone={ticket.status === 'escalated' ? 'accent' : 'neutral'}>{ticket.status}</Pill>
      </span>
      <span className="actions">
        <button className="mini" onClick={() => onAction(ticket, 'escalate')}>Escalate</button>
        <button className="mini" onClick={() => onAction(ticket, 'reassign')}>Reassign</button>
        <button className="mini" onClick={() => onAction(ticket, 'review')}>Reviewed</button>
      </span>
    </div>
  );
});
