import 'reflect-metadata';

import {
  ROLES_KEY,
  Roles,
} from './roles.decorator';

describe('Roles Decorator', () => {
  class TestController {
    adminOnly() {}

    administratorAccess() {}

    publicEndpoint() {}
  }

  // ============================================================
  // SINGLE ROLE
  // ============================================================

  it('should assign a single role to metadata', () => {
    Roles('SUPER_ADMIN')(
      TestController.prototype,
      'adminOnly',
      Object.getOwnPropertyDescriptor(
        TestController.prototype,
        'adminOnly',
      )!,
    );

    const roles = Reflect.getMetadata(
      ROLES_KEY,
      TestController.prototype.adminOnly,
    );

    expect(roles).toEqual([
      'SUPER_ADMIN',
    ]);
  });

  // ============================================================
  // MULTIPLE ROLES
  // ============================================================

  it('should assign multiple roles to metadata', () => {
    Roles(
      'SUPER_ADMIN',
      'ELECTION_COMMISSIONER',
    )(
      TestController.prototype,
      'administratorAccess',
      Object.getOwnPropertyDescriptor(
        TestController.prototype,
        'administratorAccess',
      )!,
    );

    const roles = Reflect.getMetadata(
      ROLES_KEY,
      TestController.prototype.administratorAccess,
    );

    expect(roles).toEqual([
      'SUPER_ADMIN',
      'ELECTION_COMMISSIONER',
    ]);
  });

  // ============================================================
  // NO ROLE METADATA
  // ============================================================

  it('should not define role metadata on an undecorated method', () => {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      TestController.prototype.publicEndpoint,
    );

    expect(roles).toBeUndefined();
  });

  // ============================================================
  // ROLE KEY
  // ============================================================

  it('should use the expected metadata key', () => {
    expect(ROLES_KEY).toBe('roles');
  });
});