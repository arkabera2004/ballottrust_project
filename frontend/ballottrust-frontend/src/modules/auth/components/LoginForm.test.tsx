import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const post = vi.fn();

vi.mock('../../../api/axios', () => ({
  default: {
    post: (...args: unknown[]) => post(...args),
    get: vi.fn(),
  },
}));

vi.mock('../../../utils/toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const { default: LoginForm } = await import('./LoginForm');
const { AuthProvider } = await import('../../../context/AuthContext');

/**
 * Covers the login form's client-side validation and the "Continue with
 * Google" button, which previously had no explicit `type` and therefore
 * defaulted to `type="submit"` inside the surrounding <form> — clicking it
 * submitted the (empty) login form instead of navigating to Google
 * (BT-TEST-003).
 */
describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderForm() {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </MemoryRouter>,
    );
  }

  it('shows validation errors instead of submitting when fields are invalid', async () => {
    renderForm();

    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(
      await screen.findByText('Invalid email address'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Password must be at least 8 characters'),
    ).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it('does not submit the login form when "Continue with Google" is clicked', async () => {
    renderForm();

    // Fill in otherwise-valid fields so client-side validation alone can't
    // explain a lack of a login call — only the button's type can.
    await userEvent.type(
      screen.getByPlaceholderText('Email'),
      'voter@example.com',
    );
    await userEvent.type(
      screen.getByPlaceholderText('Password'),
      'a-strong-password',
    );

    await userEvent.click(
      screen.getByRole('button', { name: /continue with google/i }),
    );

    expect(post).not.toHaveBeenCalled();
  });
});
