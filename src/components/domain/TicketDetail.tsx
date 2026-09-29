import { useNow } from '../../hooks/useTicker';
import { agentById } from '../../lib/data';
import { formatRemaining, HOUR, MINUTE, severityOf, SEVERITY_LABEL, SLA_TARGET, warningWindow } from '../../lib/sla';
import type { Ticket } from '../../lib/types';

export function TicketDetail({ ticket }: { ticket: Ticket }) {
  const now = useNow();
  const severity = severityOf(ticket, now);
  const agent = agentById[ticket.agentId];

  const rows: [string, string][] = [
    ['Customer', ticket.customer],
    ['Priority', ticket.priority],
    ['Status', ticket.status],
    ['Owner', agent.name],
    ['Team', ticket.team],
    ['Region', ticket.region],
    ['Channel', ticket.channel],
    ['SLA target', `${SLA_TARGET[ticket.priority] / HOUR}h from first contact`],
    ['Warning at', `${Math.round(warningWindow(ticket.priority) / MINUTE)}m remaining`],
    ['Deadline', new Date(ticket.deadline).toLocaleString('en-GB')],
  ];

  const events: [number, string][] = [
    [ticket.createdAt, `Ticket created via ${ticket.channel}`],
    [ticket.createdAt + 8 * MINUTE, `Auto-assigned to ${agent.name}`],
    [ticket.createdAt + 26 * MINUTE, 'First reply sent'],
    [ticket.createdAt + (26 + ticket.replies * 19) * MINUTE, `${ticket.replies} customer replies · awaiting agent`],
  ];

  return (
    <>
      <dl className="kv">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
        <div>
          <dt>State</dt>
          <dd data-severity={severity} className="state">
            {SEVERITY_LABEL[severity]} · {formatRemaining(ticket.deadline - now)}
            {severity === 'breached' ? ' overdue' : ' remaining'}
          </dd>
        </div>
      </dl>

      <div className="dsection">
        <h4>Activity</h4>
        <div className="timeline">
          {events.map(([at, text]) => (
            <div key={text}>
              <span className="mono">{new Date(at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
