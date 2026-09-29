import { useCallback, useMemo, useState } from 'react';
import { FilterBar } from './components/containers/FilterBar';
import { UrgentQueue } from './components/containers/UrgentQueue';
import { QueueShape, WorkloadPanel } from './components/containers/WorkloadPanel';
import { Drawer } from './components/primitives/Drawer';
import { Toasts } from './components/primitives/Toasts';
import { TicketDetail } from './components/domain/TicketDetail';
import { AgentDetail } from './components/domain/AgentDetail';
import { TickContext, useTickerValue } from './hooks/useTicker';
import { useFilters } from './hooks/useFilters';
import { useToasts } from './hooks/useToasts';
import { AGENTS, agentById, loadTickets } from './lib/data';
import { HOUR } from './lib/sla';
import type { Agent, Ticket } from './lib/types';

type Pane = 'urgent' | 'queue' | 'team';
type Selection = { kind: 'ticket'; ticket: Ticket } | { kind: 'agent'; agent: Agent } | null;

export default function App() {
  const now = useTickerValue();
  const [tickets, setTickets] = useState<Ticket[]>(() => loadTickets());
  const { filters, set, reset } = useFilters();
  const { toasts, push, dismiss } = useToasts();
  const [selection, setSelection] = useState<Selection>(null);
  const [pane, setPane] = useState<Pane>('urgent');

  const visible = useMemo(() => {
    const cutoff = Date.now() - filters.rangeHours * HOUR;
    return tickets.filter((t) =>
      t.createdAt >= cutoff &&
      (!filters.priority || t.priority === filters.priority) &&
      (!filters.region || t.region === filters.region) &&
      (!filters.team || t.team === filters.team) &&
      (!filters.status || t.status === filters.status));
  }, [tickets, filters]);

  /** Optimistic, with an undo. The rollback is the part worth designing. */
  const act = useCallback((ticket: Ticket, kind: 'escalate' | 'reassign' | 'review') => {
    const before = tickets;
    let message = '';

    setTickets((all) => all.map((t) => {
      if (t.id !== ticket.id) return t;
      if (kind === 'escalate') { message = `Escalated ${t.id}`; return { ...t, status: 'escalated' }; }
      if (kind === 'review') { message = `Marked ${t.id} reviewed`; return { ...t, reviewed: true }; }
      const pool = AGENTS.filter((a) => a.team === t.team && a.id !== t.agentId);
      const target = pool.sort((x, y) =>
        all.filter((v) => v.agentId === x.id).length / x.capacity -
        all.filter((v) => v.agentId === y.id).length / y.capacity)[0];
      if (!target) { message = `No other agent on ${t.team}`; return t; }
      message = `Reassigned ${t.id} to ${target.name}`;
      return { ...t, agentId: target.id };
    }));

    push(message, () => setTickets(before));
  }, [tickets, push]);

  const openTicket = useCallback((ticket: Ticket) => setSelection({ kind: 'ticket', ticket }), []);
  const openAgent = useCallback((agent: Agent) => setSelection({ kind: 'agent', agent }), []);
  const closeDrawer = useCallback(() => setSelection(null), []);

  // The drawer must reflect edits made while it is open.
  const liveSelection: Selection = selection?.kind === 'ticket'
    ? { kind: 'ticket', ticket: tickets.find((t) => t.id === selection.ticket.id) ?? selection.ticket }
    : selection;

  return (
    <TickContext.Provider value={now}>
      <header className="top">
        <div className="top-inner">
          <div className="brandrow">
            <h1 className="brand">Breach Watch <span>· Viewer Support Ops</span></h1>
            <div className="clock">
              <span className="pulse" aria-hidden="true" />
              <span>Live · <span className="mono">{new Date(now).toLocaleTimeString('en-GB')}</span></span>
            </div>
          </div>

          <FilterBar filters={filters} set={set} reset={reset}
                     visibleCount={visible.length} totalCount={tickets.length} />

          <div className="viewtabs" role="tablist" aria-label="Dashboard view">
            {(['urgent', 'queue', 'team'] as Pane[]).map((p) => (
              <button key={p} role="tab" aria-selected={pane === p} onClick={() => setPane(p)}>
                {p[0].toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="wrap">
        <div className={`pane${pane === 'urgent' ? ' active' : ''}`}>
          <UrgentQueue tickets={visible} onOpen={openTicket} onAction={act} />
        </div>

        <div className="grid2">
          <div className={`pane${pane === 'queue' ? ' active' : ''}`}>
            <QueueShape tickets={visible} />
          </div>
          <div className={`pane${pane === 'team' ? ' active' : ''}`}>
            <WorkloadPanel tickets={visible} onOpenAgent={openAgent} />
          </div>
        </div>
      </main>

      <Drawer
        open={liveSelection !== null}
        onClose={closeDrawer}
        eyebrow={liveSelection?.kind === 'ticket'
          ? liveSelection.ticket.id
          : liveSelection ? `${liveSelection.agent.team} · ${liveSelection.agent.region}` : undefined}
        title={liveSelection?.kind === 'ticket' ? liveSelection.ticket.subject : liveSelection?.agent.name}
        footer={liveSelection?.kind === 'ticket' ? (
          <>
            <button className="btn accent" onClick={() => { act(liveSelection.ticket, 'escalate'); closeDrawer(); }}>Escalate</button>
            <button className="btn" onClick={() => { act(liveSelection.ticket, 'reassign'); closeDrawer(); }}>Reassign</button>
            <button className="btn" onClick={() => { act(liveSelection.ticket, 'review'); closeDrawer(); }}>Mark reviewed</button>
          </>
        ) : undefined}
      >
        {liveSelection?.kind === 'ticket' && <TicketDetail ticket={liveSelection.ticket} />}
        {liveSelection?.kind === 'agent' && (
          <AgentDetail agent={agentById[liveSelection.agent.id]} tickets={visible} onOpenTicket={openTicket} />
        )}
      </Drawer>

      <Toasts toasts={toasts} onDismiss={dismiss} />
    </TickContext.Provider>
  );
}
