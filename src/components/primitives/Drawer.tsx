import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title?: string;
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Focus is moved into the drawer on open and returned to the trigger on close, and
 * Escape closes it. Detail lives in a drawer rather than a modal so it can be backed
 * by a route: a modal is not linkable and dies on refresh.
 */
export function Drawer({ open, onClose, eyebrow, title, footer, children }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      returnTo.current = document.activeElement as HTMLElement;
      closeRef.current?.focus();
    } else if (returnTo.current?.isConnected) {
      returnTo.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={`scrim${open ? ' show' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`drawer${open ? ' show' : ''}`} role="dialog" aria-modal="true"
             aria-label={title} hidden={!open}>
        <div className="dhead">
          <div style={{ minWidth: 0 }}>
            {eyebrow && <div className="tid mono">{eyebrow}</div>}
            <h2>{title}</h2>
          </div>
          <button ref={closeRef} className="dclose" onClick={onClose} aria-label="Close details">✕</button>
        </div>
        <div className="dbody">{children}</div>
        {footer && <div className="dfoot">{footer}</div>}
      </aside>
    </>
  );
}
