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
      <Routes>

        {PublicRoutes}

        {AuthRoutes}

        {ElectionRoutes}

        {AdminRoutes}

        {CandidateRoutes}

        {VoterRoutes}

        {CommonRoutes}

      </Routes>
    </BrowserRouter>
  );
}

export default App;