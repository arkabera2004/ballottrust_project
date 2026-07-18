import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

interface ElectionContextType {
  refreshKey: number;
  refresh: () => void;
}

const ElectionContext =
  createContext<ElectionContextType | null>(
    null,
  );

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

export function useElectionRefresh() {
  const context =
    useContext(ElectionContext);

  if (!context) {
    throw new Error(
      'useElectionRefresh must be used inside ElectionProvider.',
    );
  }

  return context;
}