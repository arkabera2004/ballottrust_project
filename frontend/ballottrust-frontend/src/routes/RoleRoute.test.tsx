import { render, screen } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import RoleRoute from './RoleRoute';
import { AuthProvider } from '../context/AuthContext';
import { AUTH_KEYS } from '../constants/auth';
import { ROLES } from '../constants/roles';

/**
 * Covers protected-route behavior (BT-TEST-003): an unauthenticated visitor
 * and a wrong-role user are both redirected away instead of seeing the
 * guarded page, and the right role sees it.
 */
describe('RoleRoute', () => {
  function renderGuarded(allowedRoles: readonly string[]) {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<div>Login Page</div>} />
            <Route
              path="/admin"
              element={
                <RoleRoute allowedRoles={allowedRoles as never[]}>
                  <div>Admin Dashboard</div>
                </RoleRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );
  }

  it('redirects an unauthenticated visitor away from the guarded page', () => {
    localStorage.clear();

    renderGuarded([ROLES.SUPER_ADMIN]);

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });

  it('redirects a logged-in user whose role is not allowed', () => {
    localStorage.setItem(
      AUTH_KEYS.USER,
      JSON.stringify({
        id: 'user-1',
        email: 'voter@example.com',
        fullName: 'A Voter',
        role: ROLES.VOTER,
      }),
    );

    renderGuarded([ROLES.SUPER_ADMIN]);

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });

  it('renders the guarded page for an allowed role', () => {
    localStorage.setItem(
      AUTH_KEYS.USER,
      JSON.stringify({
        id: 'user-1',
        email: 'admin@example.com',
        fullName: 'An Admin',
        role: ROLES.SUPER_ADMIN,
      }),
    );

    renderGuarded([ROLES.SUPER_ADMIN]);

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });
});
