import 'reflect-metadata';

import { Role } from '@prisma/client';

import { CandidateController } from './candidate.controller';

import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('CandidateController Authorization', () => {
  // ============================================================
  // HELPER
  // ============================================================

  function getMethod(name: string) {
    return CandidateController.prototype[name];
  }

  function getRoles(name: string) {
    return Reflect.getMetadata(ROLES_KEY, getMethod(name));
  }

  function getGuards(name: string) {
    return Reflect.getMetadata('__guards__', getMethod(name)) || [];
  }

  function hasGuard(name: string, guard: any) {
    return getGuards(name).includes(guard);
  }

  // ============================================================
  // ADMINISTRATIVE ROUTES
  // ============================================================

  it('should restrict candidate listing to administrators', () => {
    expect(getRoles('findAll')).toEqual([
      Role.SUPER_ADMIN,
      Role.ELECTION_COMMISSIONER,
    ]);
  });

  it('should restrict candidate verification to administrators', () => {
    expect(getRoles('verify')).toEqual([
      Role.ELECTION_COMMISSIONER,
      Role.SUPER_ADMIN,
    ]);
  });

  it('should restrict candidate approval to administrators', () => {
    expect(getRoles('approve')).toEqual([
      Role.ELECTION_COMMISSIONER,
      Role.SUPER_ADMIN,
    ]);
  });

  it('should restrict candidate rejection to administrators', () => {
    expect(getRoles('reject')).toEqual([
      Role.ELECTION_COMMISSIONER,
      Role.SUPER_ADMIN,
    ]);
  });

  it('should restrict candidate disqualification to administrators', () => {
    expect(getRoles('disqualify')).toEqual([
      Role.ELECTION_COMMISSIONER,
      Role.SUPER_ADMIN,
    ]);
  });

  // ============================================================
  // BALLOT ADMINISTRATION
  // ============================================================

  it('should restrict candidate number assignment to administrators', () => {
    expect(getRoles('assignCandidateNumber')).toEqual([
      Role.SUPER_ADMIN,
      Role.ELECTION_COMMISSIONER,
    ]);
  });

  it('should restrict automatic candidate number assignment to administrators', () => {
    expect(getRoles('autoAssignCandidateNumber')).toEqual([
      Role.SUPER_ADMIN,
      Role.ELECTION_COMMISSIONER,
    ]);
  });

  it('should restrict ballot generation to administrators', () => {
    expect(getRoles('generateBallotOrder')).toEqual([
      Role.SUPER_ADMIN,
      Role.ELECTION_COMMISSIONER,
    ]);
  });

  it('should restrict manual ballot ordering to administrators', () => {
    expect(getRoles('manualBallotOrder')).toEqual([
      Role.SUPER_ADMIN,
      Role.ELECTION_COMMISSIONER,
    ]);
  });

  it('should restrict ballot finalization to administrators', () => {
    expect(getRoles('finalizeBallot')).toEqual([
      Role.SUPER_ADMIN,
      Role.ELECTION_COMMISSIONER,
    ]);
  });

  // ============================================================
  // DOCUMENT ADMINISTRATION
  // ============================================================

  it('should restrict document verification to administrators', () => {
    expect(getRoles('verifyCandidateDocument')).toEqual([
      Role.SUPER_ADMIN,
      Role.ELECTION_COMMISSIONER,
    ]);
  });

  it('should restrict document rejection to administrators', () => {
    expect(getRoles('rejectCandidateDocument')).toEqual([
      Role.SUPER_ADMIN,
      Role.ELECTION_COMMISSIONER,
    ]);
  });

  // ============================================================
  // JWT PROTECTION
  // ============================================================

  it('should protect nomination with JWT authentication', () => {
    expect(hasGuard('nominate', JwtAuthGuard)).toBe(true);
  });

  it('should protect candidate listing with JWT authentication', () => {
    expect(hasGuard('findAll', JwtAuthGuard)).toBe(true);
  });

  it('should protect candidate approval with JWT authentication', () => {
    expect(hasGuard('approve', JwtAuthGuard)).toBe(true);
  });

  it('should protect candidate withdrawal with JWT authentication', () => {
    expect(hasGuard('withdraw', JwtAuthGuard)).toBe(true);
  });

  it('should protect candidate document access with JWT authentication', () => {
    expect(hasGuard('getCandidateDocument', JwtAuthGuard)).toBe(true);
  });

  // ============================================================
  // ROLE GUARD PROTECTION
  // ============================================================

  it('should use RolesGuard for candidate listing', () => {
    expect(hasGuard('findAll', RolesGuard)).toBe(true);
  });

  it('should use RolesGuard for candidate approval', () => {
    expect(hasGuard('approve', RolesGuard)).toBe(true);
  });

  it('should use RolesGuard for candidate rejection', () => {
    expect(hasGuard('reject', RolesGuard)).toBe(true);
  });

  it('should use RolesGuard for candidate verification', () => {
    expect(hasGuard('verify', RolesGuard)).toBe(true);
  });

  // ============================================================
  // OWNER-LEVEL ROUTES
  // ============================================================

  it('should require JWT authentication for candidate withdrawal', () => {
    expect(getGuards('withdraw')).toContain(JwtAuthGuard);
  });

  it('should require JWT authentication for candidate update', () => {
    expect(getGuards('updateCandidate')).toContain(JwtAuthGuard);
  });

  it('should require JWT authentication for candidate profile update', () => {
    expect(getGuards('updateCandidateProfile')).toContain(JwtAuthGuard);
  });

  it('should require JWT authentication for candidate document deletion', () => {
    expect(getGuards('deleteCandidateDocument')).toContain(JwtAuthGuard);
  });
});
