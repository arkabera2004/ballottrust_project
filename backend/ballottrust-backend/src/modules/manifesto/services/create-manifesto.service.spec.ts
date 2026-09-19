import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CandidateStatus, ManifestoStatus } from '@prisma/client';

import { CreateManifestoService } from './create-manifesto.service';
import { ManifestoContentSanitizer } from '../manifesto-content.sanitizer';

describe('CreateManifestoService', () => {
  let service: CreateManifestoService;

  const mockPrisma = { candidate: { findFirst: jest.fn() } };

  const mockRepository = {
    nextVersion: jest.fn(),
    create: jest.fn(),
  };

  const mockAudit = { log: jest.fn() };

  const dto = {
    candidateId: 'candidate-1',
    title: 'My Platform',
    content: '<p>Hello</p>',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockPrisma.candidate.findFirst.mockResolvedValue({
      id: 'candidate-1',
      userId: 'user-1',
      status: CandidateStatus.APPROVED,
    });
    mockRepository.nextVersion.mockResolvedValue(1);
    mockRepository.create.mockResolvedValue({ id: 'man-1', version: 1 });

    service = new CreateManifestoService(
      mockPrisma as any,
      mockRepository as any,
      new ManifestoContentSanitizer(),
      mockAudit as any,
    );
  });

  it('creates version 1 as a DRAFT for the owning candidate', async () => {
    await service.execute(dto, 'user-1');

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        version: 1,
        status: ManifestoStatus.DRAFT,
      }),
    );
  });

  it('assigns the next version rather than overwriting the previous one', async () => {
    mockRepository.nextVersion.mockResolvedValue(4);

    await service.execute(dto, 'user-1');

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ version: 4 }),
    );
  });

  it('sanitises content before storing it', async () => {
    await service.execute(
      { ...dto, content: '<p>ok</p><script>alert(1)</script>' },
      'user-1',
    );

    const stored = mockRepository.create.mock.calls[0][0] as {
      content: string;
    };

    expect(stored.content).toBe('<p>ok</p>');
    expect(stored.content).not.toContain('script');
  });

  it('rejects an unknown candidate', async () => {
    mockPrisma.candidate.findFirst.mockResolvedValue(null);

    await expect(service.execute(dto, 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('refuses to let one candidate write another candidate a manifesto', async () => {
    await expect(service.execute(dto, 'someone-else')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows an administrator to act on a candidate behalf', async () => {
    await expect(service.execute(dto, 'admin-1', true)).resolves.toBeDefined();
  });

  it.each([
    CandidateStatus.REJECTED,
    CandidateStatus.WITHDRAWN,
    CandidateStatus.DISQUALIFIED,
  ])('refuses a manifesto for a %s candidate', async (status) => {
    mockPrisma.candidate.findFirst.mockResolvedValue({
      id: 'candidate-1',
      userId: 'user-1',
      status,
    });

    await expect(service.execute(dto, 'user-1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('records an audit entry', async () => {
    await service.execute(dto, 'user-1');

    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'MANIFESTO_CREATED',
        module: 'manifesto',
      }),
    );
  });
});
