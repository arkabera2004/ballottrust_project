import { NotFoundException } from '@nestjs/common';

import { GetCandidateManifestoService } from './get-candidate-manifesto.service';

describe('GetCandidateManifestoService', () => {
  let service: GetCandidateManifestoService;

  const mockRepository = {
    findCurrent: jest.fn(),
    findPublished: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GetCandidateManifestoService(mockRepository as any);
  });

  describe('public view', () => {
    it('serves only the approved version', async () => {
      mockRepository.findPublished.mockResolvedValue({
        id: 'man-1',
        version: 2,
      });

      const result = await service.execute('candidate-1', true);

      expect(result).toEqual({ id: 'man-1', version: 2 });
      expect(mockRepository.findPublished).toHaveBeenCalledWith('candidate-1');
      // Must never fall back to the unapproved current version.
      expect(mockRepository.findCurrent).not.toHaveBeenCalled();
    });

    it('404s rather than leaking a draft when nothing is approved', async () => {
      mockRepository.findPublished.mockResolvedValue(null);

      await expect(service.execute('candidate-1', true)).rejects.toThrow(
        /no published manifesto/,
      );
      expect(mockRepository.findCurrent).not.toHaveBeenCalled();
    });
  });

  describe('candidate view', () => {
    it('serves the current version whatever its status', async () => {
      mockRepository.findCurrent.mockResolvedValue({
        id: 'man-3',
        version: 3,
      });

      const result = await service.execute('candidate-1');

      expect(result).toEqual({ id: 'man-3', version: 3 });
      expect(mockRepository.findPublished).not.toHaveBeenCalled();
    });

    it('404s when the candidate has no manifesto at all', async () => {
      mockRepository.findCurrent.mockResolvedValue(null);

      await expect(service.execute('candidate-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
