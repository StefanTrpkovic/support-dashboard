import type { Toast } from '../../hooks/useToasts';

export function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <b>{t.message}</b>
          {t.undo && (
            <button onClick={() => { t.undo!(); onDismiss(t.id); }}>Undo</button>
          )}
        </div>
      ))}
    </div>
  );
}
