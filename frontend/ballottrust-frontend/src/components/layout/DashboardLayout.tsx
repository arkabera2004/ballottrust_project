import type { ReactNode } from 'react';

import Sidebar from './Sidebar';
import Topbar from './Topbar';

type Props = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: Props) {
  return (
    <div className="flex h-screen bg-slate-100">

      {/* Sidebar */}

      <Sidebar />

      {/* Main Area */}

      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Top Navigation */}

        <Topbar />

        {/* Page Content */}

        <main className="flex-1 overflow-y-auto p-8">

          {children}

        </main>

      </div>

    </div>
  );
}