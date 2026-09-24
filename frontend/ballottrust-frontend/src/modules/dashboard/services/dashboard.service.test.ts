import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();

vi.mock('../../../api/axios', () => ({
  default: {
    get: (...args: unknown[]) => get(...args),
    patch: vi.fn(),
  },
}));

const { default: dashboardService } = await import('./dashboard.service');

describe('dashboardService.getPendingCandidates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // The service used to request /candidates/pending, which is not a route.
  // It matched @Get(':id'), whose ParseUUIDPipe rejected "pending" with a
  // 400, and the dashboard hung on "Loading Dashboard..." as a result.

  it('queries the list endpoint filtered by PENDING, not a /pending path', async () => {
    get.mockResolvedValue({ data: { data: { data: [] } } });

    await dashboardService.getPendingCandidates();

    const [url, config] = get.mock.calls[0];

    expect(url).toBe('/candidates');

    expect(url).not.toContain('pending');

    expect(config).toMatchObject({ params: { status: 'PENDING' } });
  });

  it('unwraps the rows out of the paginated envelope', async () => {
    get.mockResolvedValue({
      data: {
        success: true,
        data: {
          data: [{ id: 'candidate-1' }],
          total: 1,
          page: 1,
          totalPages: 1,
        },
      },
    });

    const result = await dashboardService.getPendingCandidates();

    expect(result).toEqual([{ id: 'candidate-1' }]);
  });
});
