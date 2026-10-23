import { createContext } from 'react';

export interface ElectionContextType {
  refreshKey: number;
  refresh: () => void;
}

/**
 * Split out of ElectionContext.tsx: react-refresh/only-export-components
 * flags a file that exports both a component (ElectionProvider) and a
 * non-component value (the context object itself).
 */
export const ElectionContext = createContext<ElectionContextType | null>(
  null,
);
