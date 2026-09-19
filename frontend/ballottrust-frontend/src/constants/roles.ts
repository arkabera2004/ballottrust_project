/**
 * The seven authenticated roles, mirroring the backend `Role` enum and
 * docs/06_User_Roles_And_Permissions.md.
 *
 * Route guards previously took bare strings, so a typo silently locked
 * everyone out of a page instead of failing loudly.
 */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ELECTION_COMMISSIONER: 'ELECTION_COMMISSIONER',
  VERIFICATION_OFFICER: 'VERIFICATION_OFFICER',
  RETURNING_OFFICER: 'RETURNING_OFFICER',
  AUDITOR: 'AUDITOR',
  CANDIDATE: 'CANDIDATE',
  VOTER: 'VOTER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Roles that administer the platform itself. */
export const PLATFORM_ADMIN_ROLES: Role[] = [ROLES.SUPER_ADMIN];

/** Roles that run elections. */
export const ELECTION_ADMIN_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ELECTION_COMMISSIONER,
];

/** Roles that review candidates, voters and documents. */
export const REVIEW_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ELECTION_COMMISSIONER,
  ROLES.VERIFICATION_OFFICER,
];

/** Roles with read access to audit and reporting surfaces. */
export const OVERSIGHT_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ELECTION_COMMISSIONER,
  ROLES.AUDITOR,
];
