/**
 * `GET /blockchain/verify` returns two different shapes depending on
 * whether an electionId was supplied: a single-election result
 * (`{electionId, valid, message, totalVotes?}`) or an aggregate across every
 * election (`{valid, elections: [...]}`), which carries no top-level
 * message/totalVotes. UI code calling the aggregate path without electionId
 * must derive those from `elections` rather than reading undefined fields,
 * or it silently shows a blank integrity status instead of a real one.
 */
export interface BlockchainVerifyResult {
  electionId?: string;
  valid: boolean;
  message?: string;
  totalVotes?: number;
  elections?: {
    electionId: string;
    valid: boolean;
    message: string;
    totalVotes?: number;
  }[];
}

export interface IntegritySummary {
  valid: boolean;
  message: string;
  totalVotes: number;
}

export function summarizeIntegrity(
  result: BlockchainVerifyResult | null | undefined,
): IntegritySummary {
  if (!result) {
    return { valid: false, message: 'Verification unavailable', totalVotes: 0 };
  }

  if (!result.elections) {
    return {
      valid: result.valid,
      message: result.message ?? (result.valid ? 'Verified' : 'Verification failed'),
      totalVotes: result.totalVotes ?? 0,
    };
  }

  const totalVotes = result.elections.reduce(
    (sum, e) => sum + (e.totalVotes ?? 0),
    0,
  );

  const invalid = result.elections.filter((e) => !e.valid);

  const message = result.valid
    ? `All ${result.elections.length} election(s) verified`
    : `${invalid.length} of ${result.elections.length} election(s) failed verification`;

  return { valid: result.valid, message, totalVotes };
}
