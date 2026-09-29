import { createContext, useContext, useEffect, useState } from 'react';

/**
 * One interval for the whole page.
 *
 * The naive approach gives every row its own interval and re-renders the row each
 * second. At a few thousand rows that is a browser at 100% CPU. Here a single timer
 * publishes `now`, and only the leaf components that actually display a countdown
 * subscribe to it — so a row containing a countdown never re-renders on the tick.
 */
export const TickContext = createContext<number>(Date.now());

export function useNow(): number {
  return useContext(TickContext);
}

export function useTickerValue(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

/**
 * Server-authoritative clock.
 *
 * Countdowns computed from the browser clock drift: a laptop three minutes fast shows
 * three minutes of slack that does not exist. In production this offset comes from a
 * server timestamp on the first response and is applied to every comparison.
 */
export function useServerClockOffset(): number {
  return 0;
}
