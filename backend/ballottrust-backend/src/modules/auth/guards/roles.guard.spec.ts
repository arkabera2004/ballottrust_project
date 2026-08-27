import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  let reflector: {
    getAllAndOverride: jest.Mock;
  };

  let context: {
    getHandler: jest.Mock;
    getClass: jest.Mock;
    switchToHttp: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    reflector = {
      getAllAndOverride: jest.fn(),
    };

    context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(),
    };

    guard = new RolesGuard(
      reflector as unknown as Reflector,
    );
  });

  // ============================================================
  // NO ROLE REQUIREMENT
  // ============================================================

  it('should allow access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(
      undefined,
    );

    const result = guard.canActivate(
      context as unknown as ExecutionContext,
    );

    expect(result).toBe(true);

    expect(
      reflector.getAllAndOverride,
    ).toHaveBeenCalled();
  });

  // ============================================================
  // SUPER ADMIN
  // ============================================================

  it('should allow SUPER_ADMIN when SUPER_ADMIN is required', () => {
    reflector.getAllAndOverride.mockReturnValue([
      'SUPER_ADMIN',
    ]);

    const request = {
      user: {
        userId: 'admin-1',
        role: 'SUPER_ADMIN',
      },
    };

    context.switchToHttp.mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    });

    const result = guard.canActivate(
      context as unknown as ExecutionContext,
    );

    expect(result).toBe(true);
  });

  // ============================================================
  // ELECTION COMMISSIONER
  // ============================================================

  it('should allow ELECTION_COMMISSIONER when required', () => {
    reflector.getAllAndOverride.mockReturnValue([
      'ELECTION_COMMISSIONER',
    ]);

    const request = {
      user: {
        userId: 'commissioner-1',
        role: 'ELECTION_COMMISSIONER',
      },
    };

    context.switchToHttp.mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    });

    const result = guard.canActivate(
      context as unknown as ExecutionContext,
    );

    expect(result).toBe(true);
  });

  // ============================================================
  // MULTIPLE ROLES
  // ============================================================

  it('should allow a user when their role is included in required roles', () => {
    reflector.getAllAndOverride.mockReturnValue([
      'SUPER_ADMIN',
      'ELECTION_COMMISSIONER',
    ]);

    const request = {
      user: {
        userId: 'commissioner-1',
        role: 'ELECTION_COMMISSIONER',
      },
    };

    context.switchToHttp.mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    });

    const result = guard.canActivate(
      context as unknown as ExecutionContext,
    );

    expect(result).toBe(true);
  });

  // ============================================================
  // WRONG ROLE
  // ============================================================

  it('should reject a user whose role is not allowed', () => {
    reflector.getAllAndOverride.mockReturnValue([
      'SUPER_ADMIN',
      'ELECTION_COMMISSIONER',
    ]);

    const request = {
      user: {
        userId: 'voter-1',
        role: 'VOTER',
      },
    };

    context.switchToHttp.mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    });

    const result = guard.canActivate(
      context as unknown as ExecutionContext,
    );

    expect(result).toBe(false);
  });

  // ============================================================
  // CANDIDATE ROLE
  // ============================================================

  it('should reject CANDIDATE from administrator-only access', () => {
    reflector.getAllAndOverride.mockReturnValue([
      'SUPER_ADMIN',
      'ELECTION_COMMISSIONER',
    ]);

    const request = {
      user: {
        userId: 'candidate-user',
        role: 'CANDIDATE',
      },
    };

    context.switchToHttp.mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    });

    const result = guard.canActivate(
      context as unknown as ExecutionContext,
    );

    expect(result).toBe(false);
  });

  // ============================================================
  // VOTER ROLE
  // ============================================================

  it('should reject VOTER from administrator-only access', () => {
    reflector.getAllAndOverride.mockReturnValue([
      'SUPER_ADMIN',
      'ELECTION_COMMISSIONER',
    ]);

    const request = {
      user: {
        userId: 'voter-user',
        role: 'VOTER',
      },
    };

    context.switchToHttp.mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    });

    const result = guard.canActivate(
      context as unknown as ExecutionContext,
    );

    expect(result).toBe(false);
  });
});