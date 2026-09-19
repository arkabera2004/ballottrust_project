import type { Request } from 'express';
import type { Role } from '@prisma/client';

/**
 * Shape attached to `request.user` by JwtStrategy.validate().
 * Kept separate from JwtPayload, which describes the *signed* token
 * (`sub`), whereas this describes the *resolved* principal (`userId`).
 */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
}

/**
 * An Express request that has passed through JwtAuthGuard and is
 * therefore guaranteed to carry an authenticated principal.
 */
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

/**
 * Principal attached to `request.user` by GoogleStrategy.validate().
 * Distinct from AuthenticatedUser: at this point the Google identity has
 * not yet been resolved to (or linked with) a BallotTrust user account.
 */
export interface GoogleOAuthUser {
  providerId: string;
  email?: string;
  fullName?: string;
  avatar?: string;
}

/** Request emerging from the Google OAuth callback guard. */
export interface GoogleOAuthRequest extends Request {
  user: GoogleOAuthUser;
}
