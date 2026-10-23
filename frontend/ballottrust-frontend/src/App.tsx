import { Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
} from 'react-router-dom';

import {
  AuthRoutes,
  ElectionRoutes,
  AdminRoutes,
  CandidateRoutes,
  VoterRoutes,
  CommonRoutes,
  PublicRoutes,
} from './routes';

function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            Loading...
          </div>
        }
      >
        <Routes>

          {PublicRoutes}

          {AuthRoutes}

          {ElectionRoutes}

          {AdminRoutes}

          {CandidateRoutes}

          {VoterRoutes}

          {CommonRoutes}

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;