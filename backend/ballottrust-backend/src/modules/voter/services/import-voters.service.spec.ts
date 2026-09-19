import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Role, VoterRegistrationSource } from '@prisma/client';

import { ImportVotersService } from './import-voters.service';

const csvFile = (body: string): Express.Multer.File =>
  ({ buffer: Buffer.from(body, 'utf8') }) as Express.Multer.File;

describe('ImportVotersService', () => {
  let service: ImportVotersService;

  const mockPrisma = {
    election: { findFirst: jest.fn() },
    user: { findFirst: jest.fn() },
  };

  const mockRepository = {
    findByUserAndElectionIncludingDeleted: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockAudit = { log: jest.fn() };

  const dto = { electionId: 'election-1' };

  const voter = (id: string, email: string) => ({
    id,
    email,
    role: Role.VOTER,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockPrisma.election.findFirst.mockResolvedValue({ id: 'election-1' });
    mockRepository.findByUserAndElectionIncludingDeleted.mockResolvedValue(
      null,
    );
    mockRepository.create.mockResolvedValue({ id: 'reg-1' });
    mockRepository.update.mockResolvedValue({ id: 'reg-1' });

    service = new ImportVotersService(
      mockPrisma as any,
      mockRepository as any,
      mockAudit as any,
    );
  });

  // ============================================================
  // Input validation
  // ============================================================

  it('rejects a missing file', async () => {
    await expect(
      service.execute(undefined as unknown as Express.Multer.File, dto, 'u'),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects an unknown election', async () => {
    mockPrisma.election.findFirst.mockResolvedValue(null);

    await expect(
      service.execute(csvFile('email\na@x.com'), dto, 'u'),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects an empty file', async () => {
    await expect(service.execute(csvFile(''), dto, 'u')).rejects.toThrow(
      /empty/,
    );
  });

  it('rejects a file with no email column', async () => {
    await expect(
      service.execute(csvFile('name,notes\nBob,hi'), dto, 'u'),
    ).rejects.toThrow(/must contain an "email" column/);
  });

  it('accepts a case-insensitive header', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(voter('u1', 'a@x.com'));

    const result = await service.execute(
      csvFile('EMAIL\na@x.com'),
      dto,
      'admin',
    );

    expect(result.imported).toBe(1);
  });

  // ============================================================
  // Row outcomes
  // ============================================================

  it('imports a valid voter', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(voter('u1', 'a@x.com'));

    const result = await service.execute(
      csvFile('email,notes\na@x.com,hello'),
      dto,
      'admin',
    );

    expect(result.imported).toBe(1);
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        source: VoterRegistrationSource.IMPORT,
        notes: 'hello',
      }),
    );
  });

  it('normalises email case and surrounding whitespace', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(voter('u1', 'a@x.com'));

    await service.execute(csvFile('email\n  A@X.CoM  '), dto, 'admin');

    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ email: 'a@x.com' }),
      }),
    );
  });

  it('fails a row with no email value', async () => {
    const result = await service.execute(
      csvFile('email,notes\n,hello'),
      dto,
      'admin',
    );

    expect(result.failed).toBe(1);
    expect(result.rows[0].reason).toMatch(/Missing email/);
  });

  it('fails a row whose account does not exist', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const result = await service.execute(
      csvFile('email\nghost@x.com'),
      dto,
      'admin',
    );

    expect(result.failed).toBe(1);
    expect(result.rows[0].reason).toMatch(/No user account/);
  });

  it('fails a row whose account is not a VOTER', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'u1',
      email: 'a@x.com',
      role: Role.CANDIDATE,
    });

    const result = await service.execute(
      csvFile('email\na@x.com'),
      dto,
      'admin',
    );

    expect(result.failed).toBe(1);
    expect(result.rows[0].reason).toMatch(/role CANDIDATE/);
  });

  it('skips a duplicate row within the same file', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(voter('u1', 'a@x.com'));

    const result = await service.execute(
      csvFile('email\na@x.com\na@x.com'),
      dto,
      'admin',
    );

    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.rows[1].reason).toMatch(/Duplicate row/);
  });

  it('skips a voter already on the roll', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(voter('u1', 'a@x.com'));
    mockRepository.findByUserAndElectionIncludingDeleted.mockResolvedValue({
      id: 'reg-1',
      deletedAt: null,
    });

    const result = await service.execute(
      csvFile('email\na@x.com'),
      dto,
      'admin',
    );

    expect(result.skipped).toBe(1);
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('revives a previously removed registration instead of inserting', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(voter('u1', 'a@x.com'));
    mockRepository.findByUserAndElectionIncludingDeleted.mockResolvedValue({
      id: 'reg-1',
      deletedAt: new Date(),
    });

    const result = await service.execute(
      csvFile('email\na@x.com'),
      dto,
      'admin',
    );

    expect(result.revived).toBe(1);
    expect(mockRepository.create).not.toHaveBeenCalled();
    expect(mockRepository.update).toHaveBeenCalledWith(
      'reg-1',
      expect.objectContaining({ deletedAt: null, status: 'PENDING' }),
    );
  });

  it('parses quoted notes containing a comma', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(voter('u1', 'a@x.com'));

    await service.execute(
      csvFile('email,notes\na@x.com,"transferred, verified"'),
      dto,
      'admin',
    );

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ notes: 'transferred, verified' }),
    );
  });

  // ============================================================
  // Dry run
  // ============================================================

  it('writes nothing and records no audit entry on a dry run', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(voter('u1', 'a@x.com'));

    const result = await service.execute(
      csvFile('email\na@x.com'),
      { ...dto, dryRun: true },
      'admin',
    );

    expect(result.dryRun).toBe(true);
    expect(result.imported).toBe(1);
    expect(mockRepository.create).not.toHaveBeenCalled();
    expect(mockAudit.log).not.toHaveBeenCalled();
  });

  // ============================================================
  // Limits and reporting
  // ============================================================

  it('rejects a file exceeding the row limit', async () => {
    const rows = Array.from({ length: 5001 }, (_, i) => `voter${i}@x.com`).join(
      '\n',
    );

    await expect(
      service.execute(csvFile(`email\n${rows}`), dto, 'admin'),
    ).rejects.toThrow(/exceeds the 5000-row limit/);
  });

  it('reports row numbers that match the spreadsheet', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const result = await service.execute(
      csvFile('email\nghost@x.com'),
      dto,
      'admin',
    );

    // Row 1 is the header, so the first data row is row 2.
    expect(result.rows[0].row).toBe(2);
  });

  it('records a FAILURE audit result when any row failed', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    await service.execute(csvFile('email\nghost@x.com'), dto, 'admin');

    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({ result: 'FAILURE' }),
    );
  });
});
