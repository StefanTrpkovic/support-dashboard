import { Card } from '../primitives/Panel';
import { AgentRow } from '../domain/AgentRow';
import { QueueBreakdown } from '../domain/QueueBreakdown';
import { useNow } from '../../hooks/useTicker';
import { AGENTS } from '../../lib/data';
import { severityOf } from '../../lib/sla';
import type { Agent, Ticket } from '../../lib/types';

export function QueueShape({ tickets }: { tickets: Ticket[] }) {
  const byStatus = [
    { label: 'Open', value: tickets.filter((t) => t.status === 'open').length },
    { label: 'Pending', value: tickets.filter((t) => t.status === 'pending').length, tone: 'warning' },
    { label: 'Escalated', value: tickets.filter((t) => t.status === 'escalated').length, tone: 'danger' },
  ];
  const byPriority = (['critical', 'high', 'normal', 'low'] as const).map((p) => ({
    label: p[0].toUpperCase() + p.slice(1),
    value: tickets.filter((t) => t.priority === p).length,
    tone: p === 'critical' ? 'danger' : p === 'high' ? 'warning' : 'accent',
  }));

  return (
    <section aria-labelledby="h-queue">
      <div className="section-head"><h2 id="h-queue">Queue shape</h2></div>
      <Card>
        <QueueBreakdown title="By status" rows={byStatus} />
        <div style={{ height: 10 }} />
        <QueueBreakdown title="By priority" rows={byPriority} />
      </Card>
    </section>
  );
}

export function WorkloadPanel({ tickets, onOpenAgent }: { tickets: Ticket[]; onOpenAgent: (a: Agent) => void }) {
  const now = useNow();

  const rows = AGENTS
    .map((agent) => {
      const mine = tickets.filter((t) => t.agentId === agent.id && t.status !== 'pending');
      return {
        agent,
        load: mine.length,
        atRisk: mine.filter((t) => severityOf(t, now) !== 'ok').length,
      };
    })
    // Most at-risk first — this panel exists to answer "who can take this?"
    .sort((a, b) => b.atRisk - a.atRisk || b.load / b.agent.capacity - a.load / a.agent.capacity);

  return (
    <section aria-labelledby="h-team">
      <div className="section-head">
        <h2 id="h-team">Team workload</h2>
        <span className="sub">Open tickets against agent capacity</span>
      </div>
      <Card>
        <div className="agents">
          {rows.map((r) => (
            <AgentRow key={r.agent.id} agent={r.agent} load={r.load} atRisk={r.atRisk} onOpen={onOpenAgent} />
          ))}
        </div>
      </Card>
    </section>
  );
}
