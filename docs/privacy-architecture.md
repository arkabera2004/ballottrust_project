# Privacy Architecture: Identity/Vote Separation

> Status: implemented (backend). Covers Sec11 of the BallotTrust master
> build prompt — a non-negotiable architectural boundary, not a convention.

## The boundary

BallotTrust never stores a structural link between a voter's identity and
the candidate they voted for. This is enforced at the schema level, not
just in application logic — no query, migration, or admin tool can join
voter identity to a candidate choice, because the two facts live in
different tables with no foreign key between them.

Two structurally distinct stores:

| Store | Table | Holds | Never holds |
|---|---|---|---|
| Eligibility / credential store | `VoterCredential` | `userId`, `electionId`, `hasVoted`, `issuedAt`, `usedAt` | which candidate was chosen |
| Anonymous vote ledger | `Vote` | `anonymousToken`, `candidateId`, `electionId`, hash chain fields | `userId`, or anything that identifies the voter |

`Vote.anonymousToken` is 32 random bytes (`crypto.randomBytes(32)`,
hex-encoded) generated at cast time. It is **not derived from `userId`** —
not a hash, not an HMAC, not an encoding of it — so it cannot be reversed
or correlated back to the voter, and no algorithm anyone runs over the
`Vote` table can recover who cast a given row.

## Cast-vote flow (`VoteService.castVote`)

1. Validate the candidate belongs to the target election and is
   `APPROVED`, and the election is `ACTIVE`.
2. Inside a single DB transaction:
   a. `upsert` a `VoterCredential` row for `(userId, electionId)` — first
      vote attempt creates it, later ones reuse it.
   b. If `hasVoted` is already `true`, reject: `"You have already voted"`.
   c. Conditionally update the credential (`WHERE hasVoted = false`) to
      `hasVoted = true`. This is the concurrency guard: two simultaneous
      requests for the same voter+election both pass step (b), but only
      one's conditional `UPDATE` matches a row — Postgres row-level
      locking serializes the pair, and the loser's update matches zero
      rows and is rejected. No separate lock table or distributed lock is
      needed.
   d. Generate the anonymous token, compute the per-election SHA-256 hash
      chain entry (see below), and insert the `Vote` row.
3. Commit. The response includes the vote's `anonymousToken` and `hash` —
   handed directly to the voter who cast it as their own private receipt.
   Handing it back to the same voter is not a privacy leak (they already
   know their own choice); it only becomes a leak if it were ever stored
   *joined* to their identity server-side, which it structurally cannot
   be.

## Why an eligibility row still references `userId`

`VoterCredential.userId` is not a privacy violation: it records only the
**fact that a credential was issued/used**, which is exactly the
eligibility bookkeeping every election needs (one vote per voter). It
never records *what* the credential was used for. The separation that
matters — and the one the brief calls out explicitly — is that this fact
can never be joined to a candidate choice, and it can't, because
`candidateId` only exists in `Vote`, which has no `userId` column and no
relation to `User` at all.

## Hash chain integrity (Sec13 precursor)

Each election's votes form their own SHA-256 hash chain, anchored at a
per-election `GENESIS_BLOCK`, not a single global chain:

```
hash = SHA256(anonymousToken + candidateId + electionId + previousHash)
```

`BlockchainService.verifyChain(electionId?)` recomputes this chain from
the published `Vote` rows and reports tamper status — independently of
`anonymousToken` ever being linked to a voter. Passing no `electionId`
verifies every election's chain independently and reports overall
validity.

This is a linear hash chain, not yet a Merkle tree (Sec13) — recomputing
integrity currently requires replaying the whole per-election chain in
order, rather than checking a single root against arbitrary leaves. A
Merkle-tree upgrade is tracked as a follow-up and does not require any
change to the identity/vote separation described here.

## What this does *not* yet cover

Explicitly out of scope for this pass (tracked separately, not silently
dropped):

- **Zero-knowledge eligibility/vote-validity proofs (Sec18).** The current
  scheme relies on server-side transactional enforcement
  (`VoterCredential`), not a cryptographic proof the voter could carry
  and have verified without trusting the server. `VoterCredential` is a
  deliberately swappable non-ZK implementation of the eligibility check —
  a future `IEligibilityProof` interface can replace step 2 above without
  touching the `Vote` ledger schema.
- **Encrypted vote payloads.** `Vote.encryptedVote`/`Vote.signature`
  columns exist in the schema but are not populated yet — `candidateId`
  is currently stored in the clear on the ledger row (acceptable given
  the row is already unlinkable to a voter, but end-to-end encryption of
  the choice itself is a further hardening step, not yet built).
- **Merkle-tree vote integrity (Sec13)** — see above.
