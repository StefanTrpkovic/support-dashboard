import { Bar } from '../primitives/Bar';
import type { Agent } from '../../lib/types';

interface Props {
  agent: Agent;
  load: number;
  atRisk: number;
  onOpen: (agent: Agent) => void;
}

export function AgentRow({ agent, load, atRisk, onOpen }: Props) {
  const pct = Math.round((load / agent.capacity) * 100);
  const band = pct >= 100 ? 'over' : pct >= 75 ? 'high' : 'ok';

  return (
    <button className="agent-row" data-load={band} onClick={() => onOpen(agent)}>
      <span className="aname">
        {agent.name}
        <small>{agent.team} · {agent.region}</small>
      </span>
      <span className="load">
        <Bar value={load} max={agent.capacity} tone={band} />
        <span className="loadtxt mono">{pct}%</span>
      </span>
      <span className="mono capacity">{load}/{agent.capacity}</span>
      <span className="arisk" data-any={atRisk > 0}>{atRisk > 0 ? `${atRisk} at risk` : '—'}</span>
    </button>
  );
}
