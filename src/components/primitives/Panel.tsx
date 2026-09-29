import type { ReactNode } from 'react';

export function Panel({ children }: { children: ReactNode }) {
  return <div className="panel">{children}</div>;
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="card">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}
