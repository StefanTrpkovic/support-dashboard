export type Priority = 'critical' | 'high' | 'normal' | 'low';
export type Status = 'open' | 'pending' | 'escalated';
export type Severity = 'breached' | 'risk' | 'ok';
export type Region = 'EMEA' | 'NA' | 'APAC' | 'LATAM';
export type Team = 'Playback' | 'Billing' | 'Access';

export interface Agent {
  id: string;
  name: string;
  team: Team;
  region: Region;
  capacity: number;
}

export interface Ticket {
  id: string;
  subject: string;
  customer: string;
  priority: Priority;
  status: Status;
  agentId: string;
  region: Region;
  team: Team;
  channel: 'chat' | 'email' | 'phone';
  /** Absolute SLA deadline. Server-authoritative — never derived from the client clock. */
  deadline: number;
  createdAt: number;
  reviewed: boolean;
  replies: number;
}

export interface Filters {
  rangeHours: number;
  priority: Priority | '';
  region: Region | '';
  team: Team | '';
  status: Status | '';
}
