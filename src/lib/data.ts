import type { Agent, Ticket } from './types';
import { MINUTE, SLA_TARGET } from './sla';

export const AGENTS: Agent[] = [
  { id: 'a1', name: 'Marta Ilieva',   team: 'Playback', region: 'EMEA',  capacity: 12 },
  { id: 'a2', name: 'Tomás Delgado',  team: 'Billing',  region: 'LATAM', capacity: 10 },
  { id: 'a3', name: 'Priya Raman',    team: 'Access',   region: 'APAC',  capacity: 12 },
  { id: 'a4', name: 'Ken Ohara',      team: 'Playback', region: 'APAC',  capacity: 10 },
  { id: 'a5', name: 'Dana Whitfield', team: 'Billing',  region: 'NA',    capacity: 14 },
  { id: 'a6', name: 'Bojan Petrov',   team: 'Playback', region: 'EMEA',  capacity: 12 },
  { id: 'a7', name: 'Aisha Kone',     team: 'Access',   region: 'EMEA',  capacity: 10 },
  { id: 'a8', name: 'Liam Brady',     team: 'Billing',  region: 'NA',    capacity: 12 },
];

export const agentById = Object.fromEntries(AGENTS.map((a) => [a.id, a])) as Record<string, Agent>;

type Seed = [string, string, Ticket['priority'], Ticket['status'], string, Ticket['region'], number, Ticket['channel']];

/** Offsets are minutes from load; negative means already past the deadline. */
const SEED: Seed[] = [
  ['Live match stream drops at kickoff on Chromecast', 'FC Hallen Supporters Club', 'critical', 'escalated', 'a1', 'EMEA', -38, 'chat'],
  ['Paid for season pass, content still locked', 'R. Okafor', 'critical', 'open', 'a5', 'NA', -12, 'email'],
  ['Cannot sign in after password reset — 500 error', 'M. Tanaka', 'critical', 'open', 'a3', 'APAC', -4, 'chat'],
  ['Stream quality capped at 480p on fibre connection', 'L. Moreau', 'high', 'open', 'a6', 'EMEA', 6, 'email'],
  ['Double charge on annual renewal', 'S. Whitcombe', 'critical', 'escalated', 'a2', 'LATAM', 9, 'phone'],
  ['Replay of yesterday’s semi-final unavailable', 'Bar Esportiu Nou', 'high', 'open', 'a1', 'EMEA', 14, 'chat'],
  ['App crashes on Samsung Tizen 2021 models', 'D. Novak', 'high', 'escalated', 'a4', 'APAC', 21, 'email'],
  ['Subscription cancelled without request', 'P. Andersen', 'high', 'open', 'a5', 'NA', 27, 'email'],
  ['Audio out of sync on HDMI output', 'G. Ferreira', 'normal', 'open', 'a4', 'LATAM', 33, 'chat'],
  ['Gift code rejected at checkout', 'H. Lindqvist', 'high', 'pending', 'a2', 'EMEA', 41, 'email'],
  ['Cannot add second device to household', 'K. Mbeki', 'normal', 'open', 'a7', 'EMEA', 52, 'chat'],
  ['Live timeline scrubbing jumps to start', 'J. Ruiz', 'high', 'open', 'a6', 'LATAM', 58, 'email'],
  ['Invoice missing VAT number', 'Kanto Sports Bar', 'normal', 'pending', 'a8', 'APAC', 74, 'email'],
  ['Buffering every 30s on mobile data', 'A. Gruber', 'high', 'open', 'a1', 'EMEA', 88, 'chat'],
  ['Account locked after travel abroad', 'N. Haddad', 'normal', 'open', 'a3', 'EMEA', 103, 'phone'],
  ['Refund not received after 10 days', 'C. Bianchi', 'high', 'escalated', 'a5', 'NA', 119, 'email'],
  ['Subtitles missing on Spanish commentary', 'V. Castillo', 'normal', 'open', 'a4', 'LATAM', 141, 'chat'],
  ['Cannot update payment card', 'E. Sørensen', 'normal', 'pending', 'a2', 'EMEA', 166, 'email'],
  ['Highlights clip download fails', 'T. Nakamura', 'low', 'open', 'a4', 'APAC', 190, 'chat'],
  ['Wrong kickoff time shown in schedule', 'O. Adeyemi', 'normal', 'open', 'a7', 'EMEA', 228, 'email'],
  ['Push notifications not arriving', 'F. Dubois', 'low', 'open', 'a6', 'EMEA', 265, 'chat'],
  ['Family plan member removed unexpectedly', 'B. Kowalski', 'normal', 'pending', 'a3', 'EMEA', 301, 'email'],
  ['Cast button missing on iPad', 'S. Ahmad', 'low', 'open', 'a4', 'APAC', 340, 'chat'],
  ['Unable to redeem operator bundle', 'Telco Partner Ops', 'high', 'pending', 'a8', 'NA', 372, 'email'],
  ['Profile avatar upload rejected', 'Y. Chen', 'low', 'open', 'a3', 'APAC', 410, 'chat'],
  ['Watchlist empty after app update', 'M. Silva', 'normal', 'open', 'a6', 'LATAM', 455, 'email'],
  ['Receipt email never delivered', 'I. Petrova', 'low', 'pending', 'a2', 'EMEA', 498, 'email'],
  ['Search returns no results for team name', 'R. Jónsson', 'low', 'open', 'a7', 'EMEA', 560, 'chat'],
  ['Parental PIN cannot be changed', 'W. Botha', 'normal', 'open', 'a3', 'EMEA', 612, 'phone'],
  ['Stats overlay overlaps player controls', 'Q. Rossi', 'low', 'open', 'a1', 'EMEA', 688, 'chat'],
  ['Cannot switch commentary language mid-match', 'U. Larsen', 'normal', 'open', 'a6', 'EMEA', 734, 'email'],
  ['Annual plan upgrade shows wrong proration', 'Z. Haddadi', 'high', 'pending', 'a5', 'NA', 790, 'email'],
];

/** Stands in for the API. Deadlines are absolute so the countdown never depends on render time. */
export function loadTickets(now = Date.now()): Ticket[] {
  return SEED.map(([subject, customer, priority, status, agentId, region, offsetMin, channel], i) => {
    const deadline = now + offsetMin * MINUTE;
    return {
      id: `TK-${4700 + i * 7}`,
      subject, customer, priority, status, agentId, region, channel,
      team: agentById[agentId].team,
      deadline,
      createdAt: deadline - SLA_TARGET[priority],
      reviewed: false,
      replies: 1 + (i % 4),
    };
  });
}
