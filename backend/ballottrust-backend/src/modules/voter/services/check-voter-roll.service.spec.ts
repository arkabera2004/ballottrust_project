import { VoterRegistrationStatus } from '@prisma/client';

import { CheckVoterRollService } from './check-voter-roll.service';

describe('CheckVoterRollService', () => {
  let service: CheckVoterRollService;

  const mockPrisma = {
    election: { findUnique: jest.fn() },
    voterRegistration: { findFirst: jest.fn() },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CheckVoterRollService(mockPrisma as any);
  });

  describe('when the election configures no registration window', () => {
    beforeEach(() => {
      mockPrisma.election.findUnique.mockResolvedValue({
        registrationStart: null,
        registrationEnd: null,
      });
    });

    it('admits the voter without consulting the roll', async () => {
      const result = await service.execute('user-1', 'election-1');

      expect(result).toEqual({
        admitted: true,
        rollEnforced: false,
        status: null,
      });
      expect(mockPrisma.voterRegistration.findFirst).not.toHaveBeenCalled();
    });

    it('admits the voter when the election does not exist', async () => {
      mockPrisma.election.findUnique.mockResolvedValue(null);

      const result = await service.execute('user-1', 'missing');

      // Vote casting rejects unknown elections earlier; the roll check
      // must not become a second, differently-worded gate for that.
      expect(result.admitted).toBe(true);
      expect(result.rollEnforced).toBe(false);
    });
  });

  describe('when the election configures a registration window', () => {
    beforeEach(() => {
      mockPrisma.election.findUnique.mockResolvedValue({
        registrationStart: new Date('2026-01-01T00:00:00.000Z'),
        registrationEnd: new Date('2026-01-10T00:00:00.000Z'),
      });
    });

    it('refuses a voter with no registration', async () => {
      mockPrisma.voterRegistration.findFirst.mockResolvedValue(null);

      const result = await service.execute('user-1', 'election-1');

      expect(result.admitted).toBe(false);
      expect(result.rollEnforced).toBe(true);
      expect(result.reason).toMatch(/not registered/);
    });

    it.each([
      VoterRegistrationStatus.PENDING,
      VoterRegistrationStatus.VERIFIED,
      VoterRegistrationStatus.REJECTED,
    ])('refuses a voter whose registration is %s', async (status) => {
      mockPrisma.voterRegistration.findFirst.mockResolvedValue({ status });

      const result = await service.execute('user-1', 'election-1');

      expect(result.admitted).toBe(false);
      expect(result.status).toBe(status);
      expect(result.reason).toContain(status);
    });

    it('admits a voter whose registration is APPROVED', async () => {
      mockPrisma.voterRegistration.findFirst.mockResolvedValue({
        status: VoterRegistrationStatus.APPROVED,
      });

      const result = await service.execute('user-1', 'election-1');

      expect(result).toEqual({
        admitted: true,
        rollEnforced: true,
        status: VoterRegistrationStatus.APPROVED,
      });
    });

    it('ignores soft-deleted registrations', async () => {
      mockPrisma.voterRegistration.findFirst.mockResolvedValue(null);

      await service.execute('user-1', 'election-1');

      expect(mockPrisma.voterRegistration.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });
  });
});
