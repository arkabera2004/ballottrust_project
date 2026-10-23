import { useContext } from 'react';

import { ElectionContext } from './election-context';

export function useElectionRefresh() {
  const context = useContext(ElectionContext);

  if (!context) {
    throw new Error(
      'useElectionRefresh must be used inside ElectionProvider.',
    );
  }

  return context;
}
