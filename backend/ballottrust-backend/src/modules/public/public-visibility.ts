import { ElectionStatus, ResultVisibility } from '@prisma/client';

/**
 * docs/07 §17: "Only approved and published content is visible."
 *
 * Centralised here rather than repeated per endpoint so the public
 * surface cannot drift: every public query filters through these.
 */

/** Election statuses that may appear on the public portal at all. */
export const PUBLIC_ELECTION_STATUSES: ElectionStatus[] = [
  ElectionStatus.PUBLISHED,
  ElectionStatus.ACTIVE,
  ElectionStatus.VOTING_CLOSED,
  ElectionStatus.RESULT_PUBLISHED,
];

/**
 * Whether results may be shown for an election.
 *
 * IMMEDIATE       — visible as soon as the election is live.
 * AFTER_CLOSURE   — visible once voting has closed.
 * MANUAL          — visible only after a commissioner publishes them,
 *                   which is what RESULT_PUBLISHED records.
 *
 * Defaults to hiding results for any combination not listed. Showing a
 * running tally during an open election would influence it, so the safe
 * default here has to be "no".
 */
export function areResultsPublic(
  status: ElectionStatus,
  visibility: ResultVisibility,
): boolean {
  if (status === ElectionStatus.RESULT_PUBLISHED) {
    return true;
  }

  if (visibility === ResultVisibility.IMMEDIATE) {
    return (
      status === ElectionStatus.ACTIVE ||
      status === ElectionStatus.VOTING_CLOSED
    );
  }

  if (visibility === ResultVisibility.AFTER_CLOSURE) {
    return status === ElectionStatus.VOTING_CLOSED;
  }

  return false;
}
