import { Bar } from '../primitives/Bar';

interface Props {
  title: string;
  rows: { label: string; value: number; tone?: string }[];
}

export function QueueBreakdown({ title, rows }: Props) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <>
      <h3>{title}</h3>
      {rows.map((r) => (
        <div className="qrow" key={r.label}>
          <span className="qname">{r.label}</span>
          <Bar value={r.value} max={max} tone={r.tone} />
          <span className="qnum mono">{r.value}</span>
        </div>
      ))}
    </>
  );
}
