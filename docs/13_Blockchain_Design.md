# BallotTrust
# Blockchain Design

**Version:** 1.0
**Document Version:** 1.0
**Prepared By:** Shahid Irfan Hussain
**Status:** Approved

---

# Table of Contents

1. Introduction
2. Objectives
3. Why Blockchain?
4. Blockchain Architecture
5. Trust Model
6. Data Flow
7. Blockchain Components
8. Vote Verification
9. Smart Contracts
10. Consensus
11. Security
12. Limitations
13. Future Enhancements

---

# 1. Introduction

BallotTrust uses blockchain as an integrity verification layer.

The blockchain is **not** responsible for business logic, authentication, or user management.

Its purpose is to provide immutable proof that election data has not been altered after publication.

---

# 2. Objectives

The blockchain layer aims to:

- Prevent undetected data tampering
- Improve public trust
- Provide independent verification
- Preserve vote anonymity
- Enable transparent auditing

---

# 3. Why Blockchain?

Traditional databases allow administrators to update records.

Although BallotTrust protects changes through audit logs and access control, blockchain provides an additional guarantee:

- Every published record is cryptographically linked.
- Any alteration becomes immediately detectable.
- Independent parties can verify integrity without accessing confidential data.

---

# 4. Blockchain Architecture

```
                PostgreSQL
                     │
                     ▼
          Verification Service
                     │
                     ▼
             Hash Generator
                     │
                     ▼
              Blockchain Ledger
                     │
                     ▼
        Public Verification Portal
```

The database remains the operational source of truth.

The blockchain stores only verification data.

---

# 5. Trust Model

The blockchain stores:

- Hashes
- Timestamps
- Election IDs
- Transaction IDs
- Previous Block Hashes

The blockchain does NOT store:

- Passwords
- Personal information
- Votes
- Candidate documents
- Authentication data

---

# 6. Data Flow

Election Published

↓

Election Snapshot Generated

↓

SHA-256 Hash Created

↓

Hash Written to Blockchain

↓

Transaction ID Returned

↓

Database Stores Transaction ID

↓

Public Verification Available

---

Vote Verification

↓

Vote Receipt Generated

↓

Receipt Hash Created

↓

Hash Stored on Blockchain

↓

Verification Portal Confirms Integrity

---

# 7. Blockchain Components

## Block

Each block contains:

- Block Number
- Timestamp
- Previous Hash
- Current Hash
- Transaction List

---

## Transaction

Each transaction stores:

- Transaction ID
- Election ID
- Entity Type
- Entity ID
- SHA-256 Hash
- Timestamp

---

## Ledger

The ledger is append-only.

Blocks cannot be modified once confirmed.

---

# 8. Vote Verification

Every successful vote generates:

- Vote Receipt ID
- Verification Hash
- Timestamp

The receipt contains no voter identity.

Verification Process

1. User enters receipt code.
2. System retrieves blockchain transaction.
3. Hash is recalculated.
4. Hashes are compared.
5. Verification result is displayed.

Possible Results

- Verified
- Invalid
- Not Found

---

# 9. Smart Contracts

Future versions may use smart contracts for:

Election Publication

Candidate Approval

Result Publication

Vote Verification

Document Verification

Smart contracts must never expose confidential data.

---

# 10. Consensus

Version 1

Permissioned Blockchain

Consensus Options

- Proof of Authority (PoA)
- RAFT
- IBFT

Recommended

Proof of Authority

Reasons

- Fast confirmation
- Low energy usage
- Controlled validator set
- Enterprise suitability

---

# 11. Security

Every blockchain transaction includes:

- SHA-256 Hash
- Digital Signature
- Timestamp
- Previous Block Hash

Security Goals

- Immutability
- Tamper Detection
- Integrity Verification
- Non-Repudiation

---

# 12. Limitations

Blockchain is not intended to:

- Replace PostgreSQL
- Store files
- Manage authentication
- Execute business workflows
- Replace audit logging

It complements the core platform by providing independent verification.

---

# 13. Future Enhancements

Version 2.0

- Hyperledger Fabric Integration
- Ethereum Compatibility
- Smart Contract Automation
- Distributed Validator Nodes
- Cross-Organization Verification
- Merkle Tree Optimization
- Public Blockchain Anchoring
- Zero-Knowledge Proofs (ZKP)

---

# Example Block Structure

Block Number

1254

Previous Hash

7a81...

Current Hash

c91f...

Timestamp

2026-07-15T10:45:22Z

Transactions

- Election Published
- Vote Receipt
- Result Published

---

# Example Transaction

Transaction ID

TX-20260715-001

Entity

Election

Entity ID

ELEC-2026-001

Hash

SHA-256(...)

Timestamp

2026-07-15T10:45:22Z

---

# Blockchain Verification Process

User

↓

Verification Portal

↓

Retrieve Blockchain Transaction

↓

Recalculate SHA-256 Hash

↓

Compare Hashes

↓

Display Result

---

# Design Principles

- Blockchain is an integrity layer, not a database.
- Personal data never leaves the primary database.
- Verification must be possible without revealing confidential information.
- The blockchain should remain vendor-neutral to allow future migration.

---

# Document Approval

| Version | Date | Author | Status |
|----------|------|--------|--------|
| 1.0 | July 2026 | Shahid Irfan Hussain | Approved |