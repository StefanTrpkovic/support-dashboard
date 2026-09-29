import type { Filters } from '../../lib/types';

interface Props {
  filters: Filters;
  set: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  reset: () => void;
  visibleCount: number;
  totalCount: number;
}

const RANGES = [[24, 'Last 24h'], [72, 'Last 3 days'], [168, 'Last 7 days'], [720, 'Last 30 days']] as const;

export function FilterBar({ filters, set, reset, visibleCount, totalCount }: Props) {
  return (
    <div className="filters" role="group" aria-label="Filter tickets">
      <Field label="Range" id="f-range">
        <select id="f-range" value={filters.rangeHours}
                onChange={(e) => set('rangeHours', Number(e.target.value))}>
          {RANGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </Field>

      <Select id="f-priority" label="Priority" value={filters.priority}
              options={['critical', 'high', 'normal', 'low']}
              onChange={(v) => set('priority', v as Filters['priority'])} />
      <Select id="f-region" label="Region" value={filters.region}
              options={['EMEA', 'NA', 'APAC', 'LATAM']}
              onChange={(v) => set('region', v as Filters['region'])} />
      <Select id="f-team" label="Team" value={filters.team}
              options={['Playback', 'Billing', 'Access']}
              onChange={(v) => set('team', v as Filters['team'])} />
      <Select id="f-status" label="Status" value={filters.status}
              options={['open', 'pending', 'escalated']}
              onChange={(v) => set('status', v as Filters['status'])} />

      <div className="filter-tail">
        <span className="count-note">{visibleCount} of {totalCount} tickets in view</span>
        <button className="btn" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="fgroup">
      <label className="flabel" htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

function Select({ id, label, value, options, onChange }:
  { id: string; label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <Field label={label} id={id}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </Field>
  );
}
