import { useNow } from '../../hooks/useTicker';
import { formatRemaining, severityOf } from '../../lib/sla';
import type { Agent, Ticket } from '../../lib/types';

interface Props {
  agent: Agent;
  tickets: Ticket[];
  onOpenTicket: (ticket: Ticket) => void;
}

export function AgentDetail({ agent, tickets, onOpenTicket }: Props) {
  const now = useNow();
  const mine = tickets.filter((t) => t.agentId === agent.id);
  const atRisk = mine.filter((t) => severityOf(t, now) !== 'ok').sort((a, b) => a.deadline - b.deadline);

  const stats: [string, string | number][] = [
    ['Assigned', `${mine.length} tickets`],
    ['Capacity', agent.capacity],
    ['At risk', atRisk.length],
    ['Breached', mine.filter((t) => severityOf(t, now) === 'breached').length],
    ['Median first reply', '26m'],
    ['Reopen rate', '4.1%'],
  ];

  return (
    <>
      <dl className="kv">
        {stats.map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
      <div className="dsection">
        <h4>Their tickets at risk</h4>
        {atRisk.length === 0 && <p className="muted">None — this agent has headroom.</p>}
        {atRisk.map((t) => (
          <button key={t.id} className="mini block" onClick={() => onOpenTicket(t)}>
            {t.id} · {formatRemaining(t.deadline - now)} · {t.subject}
          </button>
        ))}
      </div>
    </>
  );
}
