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
} from './routes';

function App() {
  return (
    <BrowserRouter>
      <Routes>

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