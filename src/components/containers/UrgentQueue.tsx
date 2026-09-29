import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Panel } from '../primitives/Panel';
import { TicketRow } from '../domain/TicketRow';
import { useNow } from '../../hooks/useTicker';
import { severityOf } from '../../lib/sla';
import type { Severity, Ticket } from '../../lib/types';

interface Props {
  tickets: Ticket[];
  onOpen: (ticket: Ticket) => void;
  onAction: (ticket: Ticket, kind: 'escalate' | 'reassign' | 'review') => void;
}

interface Frozen {
  ticket: Ticket;
  severity: Severity;
}

export function UrgentQueue({ tickets, onOpen, onAction }: Props) {
  const now = useNow();

  const current = useMemo(() => (
    tickets
      .filter((t) => !t.reviewed && severityOf(t, now) !== 'ok')
      .sort((a, b) => a.deadline - b.deadline)
      .map((ticket) => ({ ticket, severity: severityOf(ticket, now) }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [tickets, Math.floor(now / 1000)]);

  /**
   * The rendered order is frozen deliberately.
   *
   * Tickets cross into at-risk on their own. Re-sorting live moves a row out from
   * under a click that is already in motion. So we hold the order, count what has
   * changed, announce it politely, and let the manager decide when to re-sort.
   */
  const [frozen, setFrozen] = useState<Frozen[]>(current);
  const mounted = useRef(false);

  const resort = useCallback(() => setFrozen(current), [current]);

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; setFrozen(current); }
  }, [current]);

  // An action or a filter change is an explicit interaction, so re-sorting then is fine.
  const signature = tickets.map((t) => `${t.id}:${t.status}:${t.reviewed}`).join('|');
  useEffect(() => { setFrozen(current); /* eslint-disable-next-line */ }, [signature]);

  const pending = useMemo(() => {
    const frozenIds = frozen.map((f) => f.ticket.id).join(',');
    const currentIds = current.map((c) => c.ticket.id).join(',');
    let changed = frozenIds !== currentIds ? 1 : 0;
    for (const f of frozen) {
      const live = severityOf(f.ticket, now);
      if (live !== f.severity) changed++;
    }
    return changed;
  }, [frozen, current, now]);

  const breached = frozen.filter((f) => severityOf(f.ticket, now) === 'breached').length;

  return (
    <section aria-labelledby="h-urgent">
      <div className="section-head">
        <h2 id="h-urgent">Needs you now</h2>
        <span className="sub">
          {frozen.length > 0 ? (
            <><b>{breached} breached</b> · {frozen.length - breached} inside the warning window · sorted by time remaining</>
          ) : 'Nothing at risk right now.'}
        </span>
      </div>

      {pending > 0 && (
        <div className="banner" role="status" aria-live="polite">
          <span>
            {pending === 1
              ? '1 ticket changed SLA state since this list was sorted.'
              : `${pending} tickets changed SLA state since this list was sorted.`}
          </span>
          <button onClick={resort}>Re-sort list</button>
        </div>
      )}

      <Panel>
        <div className="list-head" aria-hidden="true">
          <span /><span>Ticket</span><span>Subject / customer</span><span>SLA</span>
          <span className="col-priority">Priority</span>
          <span className="col-status">Status</span>
          <span>Actions</span>
        </div>

        {frozen.length === 0 && (
          <div className="empty">
            No tickets at or near breach in this view. Widen the filters to check the wider queue.
          </div>
        )}

        {frozen.map(({ ticket }) => (
          <TicketRow
            key={ticket.id}
            ticket={ticket}
            severity={severityOf(ticket, now)}
            onOpen={onOpen}
            onAction={onAction}
          />
        ))}
      </Panel>
    </section>
  );
}
