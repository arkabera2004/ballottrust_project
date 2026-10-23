import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const post = vi.fn();
const get = vi.fn();

vi.mock('../../../api/axios', () => ({
  default: {
    post: (...args: unknown[]) => post(...args),
    get: (...args: unknown[]) => get(...args),
  },
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock('../../../utils/toast', () => ({
  default: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

const navigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

const { useLogin } = await import('./useLogin');
const { AuthProvider } = await import('../../../context/AuthContext');

/**
 * Covers the two outcomes a real login submission can have: a successful
 * login that stores the session and routes by role, and a server
 * rejection that surfaces the real message via Toast rather than crashing
 * or showing a generic error (BT-TEST-003).
 */
describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    );
  }

  it('logs in a voter and routes to the voter dashboard', async () => {
    post.mockResolvedValue({
      data: {
        data: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
          user: {
            id: 'user-1',
            email: 'voter@example.com',
            fullName: 'Voter One',
            role: 'VOTER',
          },
        },
      },
    });

    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      await result.current.login('voter@example.com', 'password123');
    });

    expect(toastSuccess).toHaveBeenCalledWith('Welcome back, Voter One!');
    expect(navigate).toHaveBeenCalledWith('/voter');
    expect(result.current.loading).toBe(false);
  });

  it('shows the server-provided message on rejected credentials', async () => {
    post.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Invalid credentials' } },
    });

    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      await result.current.login('voter@example.com', 'wrong-password');
    });

    expect(toastError).toHaveBeenCalledWith('Invalid credentials');
    expect(navigate).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('redirects to email verification when the account is unverified', async () => {
    vi.useFakeTimers();

    post.mockRejectedValue({
      isAxiosError: true,
      response: {
        data: { message: 'Please verify your email first.' },
      },
    });

    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      await result.current.login('voter@example.com', 'password123');
    });

    expect(sessionStorage.getItem('verificationEmail')).toBe(
      'voter@example.com',
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(navigate).toHaveBeenCalledWith('/verify-email', {
      state: { email: 'voter@example.com' },
    });

    vi.useRealTimers();
  });
});
