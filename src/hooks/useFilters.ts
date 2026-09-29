import { useCallback, useEffect, useState } from 'react';
import type { Filters } from '../lib/types';

const DEFAULTS: Filters = { rangeHours: 72, priority: '', region: '', team: '', status: '' };

function read(): Filters {
  const p = new URLSearchParams(window.location.search);
  return {
    rangeHours: Number(p.get('range')) || DEFAULTS.rangeHours,
    priority: (p.get('priority') ?? '') as Filters['priority'],
    region: (p.get('region') ?? '') as Filters['region'],
    team: (p.get('team') ?? '') as Filters['team'],
    status: (p.get('status') ?? '') as Filters['status'],
  };
}

/**
 * Filters live in the URL, not in component state.
 *
 * A manager has to be able to paste "the EMEA critical view" into a chat, and the
 * view has to survive a refresh. Keeping the filter set in the query string also
 * makes the eventual server-side filtering request cacheable.
 */
export function useFilters() {
  const [filters, setFilters] = useState<Filters>(read);

  useEffect(() => {
    const p = new URLSearchParams();
    if (filters.rangeHours !== DEFAULTS.rangeHours) p.set('range', String(filters.rangeHours));
    if (filters.priority) p.set('priority', filters.priority);
    if (filters.region) p.set('region', filters.region);
    if (filters.team) p.set('team', filters.team);
    if (filters.status) p.set('status', filters.status);
    const qs = p.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [filters]);

  const set = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }));
  }, []);

  const reset = useCallback(() => setFilters(DEFAULTS), []);

  return { filters, set, reset };
}
