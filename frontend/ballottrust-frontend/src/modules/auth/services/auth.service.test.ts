import { beforeEach, describe, expect, it, vi } from 'vitest';

const post = vi.fn();
const get = vi.fn();

vi.mock('../../../api/axios', () => ({
  default: {
    post: (...args: unknown[]) => post(...args),
    get: (...args: unknown[]) => get(...args),
  },
}));

const { default: authService } = await import('./auth.service');

describe('authService.register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // register() used to be a stub that threw "Method not implemented.", so
  // every signup surfaced as a generic "Registration Failed" toast. These
  // assertions pin the real call down.

  it('posts the signup payload to the register endpoint', async () => {
    post.mockResolvedValue({ data: { data: { userId: 'user-1' } } });

    await authService.register({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'a-strong-password',
      role: 'VOTER',
    });

    expect(post).toHaveBeenCalledWith('/auth/register', {
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'a-strong-password',
      role: 'VOTER',
    });
  });

  it('unwraps the response envelope', async () => {
    post.mockResolvedValue({
      data: {
        success: true,
        data: {
          success: true,
          message: 'Registration successful.',
          userId: 'user-1',
        },
      },
    });

    const result = await authService.register({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'a-strong-password',
      role: 'CANDIDATE',
    });

    expect(result.userId).toBe('user-1');
  });

  it('propagates a rejection so the caller can surface the server message', async () => {
    post.mockRejectedValue({
      response: { data: { message: 'Email already registered' } },
    });

    await expect(
      authService.register({
        fullName: 'Ada Lovelace',
        email: 'taken@example.com',
        password: 'a-strong-password',
        role: 'VOTER',
      }),
    ).rejects.toMatchObject({
      response: { data: { message: 'Email already registered' } },
    });
  });
});
