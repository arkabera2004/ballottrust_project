import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import './index.css';

import App from './App';

import { AuthProvider } from './context/AuthContext';
import { ElectionProvider } from './modules/election/context/ElectionContext';

const queryClient = new QueryClient();

createRoot(
  document.getElementById('root')!,
).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ElectionProvider>
          <Toaster
            position="top-right"
            reverseOrder={false}
          />

          <App />
        </ElectionProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);