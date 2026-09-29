import { useCallback, useState } from 'react';

export interface Toast {
  id: number;
  message: string;
  undo?: () => void;
}

let nextId = 1;

/**
 * Actions apply immediately and offer an undo rather than blocking the row behind a
 * spinner. The rollback path is the part worth designing; the happy path is easy.
 */
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((message: string, undo?: () => void) => {
    const id = nextId++;
    setToasts((t) => [...t, { id, message, undo }]);
    window.setTimeout(() => dismiss(id), undo ? 6000 : 2600);
  }, [dismiss]);

  return { toasts, push, dismiss };
}
