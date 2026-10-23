import {
  useState,
  type ReactNode,
} from 'react';

import { ElectionContext } from './election-context';

export function ElectionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [refreshKey, setRefreshKey] =
    useState(0);

  function refresh() {
    setRefreshKey((value) => value + 1);
  }

  return (
    <ElectionContext.Provider
      value={{
        refreshKey,
        refresh,
      }}
    >
      {children}
    </ElectionContext.Provider>
  );
}