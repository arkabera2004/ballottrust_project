import { UpdateCandidateProfileService } from './update-candidate-profile.service';
import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateStatusValidator } from '../validators/candidate-status.validator';
import { CandidateStatus } from '@prisma/client';

describe('UpdateCandidateProfileService', () => {
  it('should update the candidate biography', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue({
        id: 'candidate-1',
        userId: 'user-1',
        status: CandidateStatus.PENDING,
      }),
      update: jest.fn().mockResolvedValue({
        id: 'candidate-1',
        biography: 'Updated biography',
      }),
    };

    const statusValidator = {
      validateEditable: jest.fn(),
    };

    const service = new UpdateCandidateProfileService(
      repository as unknown as CandidateRepository,
      statusValidator as unknown as CandidateStatusValidator,
    );

    const result = await service.execute('candidate-1', 'user-1', {
      biography: '  Updated biography  ',
    });

    expect(result.biography).toBe('Updated biography');

    expect(repository.update).toHaveBeenCalledWith('candidate-1', {
      biography: 'Updated biography',
    });
  });

  it('should reject another user from updating the candidate profile', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue({
        id: 'candidate-1',
        userId: 'owner-user',
        status: CandidateStatus.PENDING,
      }),
      update: jest.fn(),
    };

    const statusValidator = {
      validateEditable: jest.fn(),
    };

    const service = new UpdateCandidateProfileService(
      repository as unknown as CandidateRepository,
      statusValidator as unknown as CandidateStatusValidator,
    );

    await expect(
      service.execute('candidate-1', 'different-user', {
        biography: 'Unauthorized update',
      } as any),
    ).rejects.toThrow('You can only update your own candidate profile.');

    expect(statusValidator.validateEditable).not.toHaveBeenCalled();

    expect(repository.update).not.toHaveBeenCalled();
  });
});
