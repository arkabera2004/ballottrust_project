# BallotTrust
# Database Design Document

**Version:** 1.0  
**Document Version:** 1.0  
**Prepared By:** Shahid Irfan Hussain  
**Database:** PostgreSQL  
**ORM:** Prisma ORM  
**Status:** Approved

---

# Table of Contents

1. Overview
2. Database Design Principles
3. Entity Classification
4. Core Entities
5. Relationship Overview
6. Database Standards
7. Audit Strategy
8. Soft Delete Strategy
9. Indexing Strategy
10. Future Expansion

---

# 1. Overview

The BallotTrust database is designed using a relational architecture powered by PostgreSQL and Prisma ORM.

The database supports:

- Secure data storage
- High normalization
- Auditability
- Scalability
- Maintainability
- Future microservice migration

Every entity is designed around business domains instead of technical implementation.

---

# 2. Database Design Principles

The database follows these principles:

- Third Normal Form (3NF)
- UUID Primary Keys
- Foreign Key Integrity
- Soft Deletes
- Audit Logging
- Timestamp Tracking
- Optimistic Expansion
- Minimal Data Duplication

Every entity includes:

- id
- createdAt
- updatedAt

Most business entities additionally include:

- deletedAt
- createdBy
- updatedBy

---

# 3. Entity Classification

The database is divided into business domains.

Authentication Domain

- User
- Role
- Permission
- Session
- RefreshToken
- OAuthAccount

---

Election Domain

- Election
- ElectionTimeline
- ElectionSettings
- ElectionStatistics

---

Candidate Domain

- Candidate
- CandidateProfile
- CandidateManifesto
- CandidateEducation
- CandidateExperience
- CandidateAchievement
- CandidateSocialLink

---

Document Domain

- Document
- DocumentVersion
- DocumentReview
- DocumentCategory

---

Voter Domain

- Voter
- VoterVerification
- VoterRegistration
- PollingStation
- Constituency

---

Voting Domain

- Ballot
- BallotCandidate
- Vote
- VoteReceipt

---

Result Domain

- Result
- Winner
- ElectionSummary

---

Workflow Domain

- Workflow
- WorkflowStep
- WorkflowTask
- WorkflowComment

---

Notification Domain

- Notification
- NotificationTemplate

---

Audit Domain

- AuditLog
- LoginHistory
- ActivityHistory

---

Reporting Domain

- Report
- ReportExport

---

Configuration Domain

- SystemConfiguration
- EmailTemplate
- FeatureFlag

---

# 4. Core Entities

## Authentication

User

Stores platform users.

Relationships

User

↓

Role

↓

Permissions

↓

Sessions

↓

Audit Logs

---

## Election

Stores every election.

Relationships

Election

↓

Candidates

↓

Voters

↓

Votes

↓

Results

↓

Audit

---

## Candidate

Stores candidate information.

Relationships

Candidate

↓

Profile

↓

Manifesto

↓

Documents

↓

Election

↓

Workflow

↓

Audit

---

## Manifesto

Stores candidate promises.

Relationships

Manifesto

↓

Images

↓

Videos

↓

Attachments

↓

Approval Workflow

---

## Voter

Stores eligible voters.

Relationships

Voter

↓

Verification

↓

Registration

↓

Election

↓

Vote

↓

Audit

---

## Vote

Stores encrypted votes.

Relationships

Vote

↓

Election

↓

Candidate

↓

Receipt

↓

Audit

---

## Workflow

Generic workflow engine.

Used by

Election

Candidate

Manifesto

Document

Voter

Results

---

## Document

Centralized file storage.

Relationships

Document

↓

Versions

↓

Reviews

↓

History

↓

Audit

---

## Audit

Tracks every platform action.

Stores

Actor

Action

Target

Timestamp

IPAddress

UserAgent

Old Values

New Values

---

# 5. Relationship Overview

One User

↓

Many Elections

↓

Many Candidates

↓

Many Voters

↓

Many Votes

↓

One Result

---

Candidate

↓

One Profile

↓

One Manifesto

↓

Many Documents

↓

Many Elections

---

Election

↓

Many Candidates

↓

Many Voters

↓

Many Votes

↓

One Result

---

Workflow

↓

Many Tasks

↓

Many Comments

↓

Many Approvals

---

Document

↓

Many Versions

↓

Many Reviews

↓

Audit History

---

# 6. Database Standards

Primary Keys

UUID

---

Foreign Keys

Required wherever relationships exist.

---

Timestamps

createdAt

updatedAt

deletedAt

---

Naming Convention

Tables

PascalCase

Columns

camelCase

Enums

UPPER_SNAKE_CASE

---

# 7. Audit Strategy

Every business entity supports auditing.

Audit includes:

- Create
- Update
- Delete
- Approve
- Reject
- Publish
- Login
- Logout
- Vote
- Download

Every audit record stores:

- User
- Module
- Action
- Previous Data
- New Data
- Timestamp

---

# 8. Soft Delete Strategy

Business records are never permanently deleted.

Instead:

deletedAt

is populated.

Advantages:

- Recovery
- Audit
- Reporting
- Compliance

---

# 9. Indexing Strategy

Indexes will be created on:

Primary Keys

Foreign Keys

Email

Election Code

Election Status

Candidate Status

Voter Status

Workflow Status

Document Status

Created Date

Updated Date

---

Composite indexes will be used where appropriate.

Example

Election Status + Start Date

Workflow Status + Assigned User

Candidate Status + Election

---

# 10. Future Expansion

The database is designed for future additions including:

- Multi-Tenant Organizations
- Blockchain Nodes
- AI Prediction Models
- Mobile Device Registration
- Digital Signatures
- Smart Contracts
- External Integrations
- GIS Data
- Public APIs

---

# Database Principles

The BallotTrust database follows:

✔ Normalized Design

✔ Referential Integrity

✔ Auditability

✔ Scalability

✔ Security

✔ Performance

✔ Maintainability

✔ Enterprise Readiness

---

# Document Approval

| Version | Date | Author | Status |
|----------|------|--------|--------|
| 1.0 | July 2026 | Shahid Irfan Hussain | Approved |