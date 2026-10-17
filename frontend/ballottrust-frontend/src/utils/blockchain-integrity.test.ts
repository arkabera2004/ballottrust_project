import { describe, expect, it } from 'vitest';

import { summarizeIntegrity } from './blockchain-integrity';

describe('summarizeIntegrity', () => {
  it('passes through a single-election result unchanged', () => {
    expect(
      summarizeIntegrity({
        electionId: 'election-1',
        valid: true,
        message: 'Blockchain integrity verified',
        totalVotes: 5,
      }),
    ).toEqual({
      valid: true,
      message: 'Blockchain integrity verified',
      totalVotes: 5,
    });
  });

  it('derives totalVotes and a message from the aggregate elections list', () => {
    expect(
      summarizeIntegrity({
        valid: true,
        elections: [
          { electionId: 'election-1', valid: true, message: 'ok', totalVotes: 3 },
          { electionId: 'election-2', valid: true, message: 'No votes found' },
        ],
      }),
    ).toEqual({
      valid: true,
      message: 'All 2 election(s) verified',
      totalVotes: 3,
    });
  });

  it('reports failing elections instead of a false success', () => {
    expect(
      summarizeIntegrity({
        valid: false,
        elections: [
          { electionId: 'election-1', valid: false, message: 'Hash mismatch', totalVotes: 2 },
          { electionId: 'election-2', valid: true, message: 'ok', totalVotes: 1 },
        ],
      }),
    ).toEqual({
      valid: false,
      message: '1 of 2 election(s) failed verification',
      totalVotes: 3,
    });
  });

  it('treats a missing result as unverified, not successful', () => {
    expect(summarizeIntegrity(null)).toEqual({
      valid: false,
      message: 'Verification unavailable',
      totalVotes: 0,
    });
  });
});
