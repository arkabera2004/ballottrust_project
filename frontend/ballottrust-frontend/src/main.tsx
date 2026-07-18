import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';

import './index.css';

import App from './App';

import { AuthProvider } from './context/AuthContext';
import { ElectionProvider } from './modules/election/context/ElectionContext';

createRoot(
  document.getElementById('root')!,
).render(
  <StrictMode>
    <AuthProvider>
      <ElectionProvider>
        <Toaster
          position="top-right"
          reverseOrder={false}
        />

        <App />
      </ElectionProvider>
    </AuthProvider>
  </StrictMode>,
);