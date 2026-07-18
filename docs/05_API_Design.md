# BallotTrust
# API Design Document

**Version:** 1.0
**Document Version:** 1.0
**Prepared By:** Shahid Irfan Hussain
**Architecture:** REST API
**Backend:** NestJS
**Status:** Approved

---

# Table of Contents

1. Overview
2. API Standards
3. Authentication
4. Request Lifecycle
5. Response Standards
6. Error Handling
7. API Modules
8. Security
9. Versioning
10. Future Expansion

---

# 1. Overview

BallotTrust exposes a RESTful API that serves the frontend application and future third-party integrations.

Every API follows consistent naming conventions, validation rules, response structures, and security practices.

The API is designed to be:

- RESTful
- Secure
- Predictable
- Versionable
- Well Documented
- Scalable

---

# 2. API Standards

## Base URL

/api/v1

---

## HTTP Methods

GET

Retrieve resources.

POST

Create resources.

PUT

Replace resources.

PATCH

Partial update.

DELETE

Soft delete.

---

## Content Type

application/json

Multipart/Form-Data (File Upload)

---

## Authentication Header

Authorization

Bearer <JWT>

---

# 3. Standard Response Format

## Success

{
  "success": true,
  "message": "Election created successfully.",
  "data": {},
  "timestamp": ""
}

---

## Error

{
  "success": false,
  "message": "Validation failed.",
  "errors": [],
  "timestamp": ""
}

---

# 4. Request Lifecycle

Client

↓

JWT Authentication

↓

Role Validation

↓

DTO Validation

↓

Controller

↓

Service

↓

Repository

↓

Prisma

↓

Database

↓

Audit Service

↓

Notification Service

↓

Response

---

# 5. Authentication APIs

POST

/auth/login

/auth/register

/auth/logout

/auth/refresh

/auth/forgot-password

/auth/reset-password

/auth/change-password

/auth/verify-email

/auth/google

/auth/profile

---

# 6. User Management APIs

GET

/users

/users/:id

POST

/users

PATCH

/users/:id

DELETE

/users/:id

PATCH

/users/:id/status

GET

/users/statistics

---

# 7. Election APIs

GET

/elections

/elections/:id

/elections/statistics

POST

/elections

PATCH

/elections/:id

DELETE

/elections/:id

PATCH

/elections/:id/submit

PATCH

/elections/:id/approve

PATCH

/elections/:id/publish

PATCH

/elections/:id/start

PATCH

/elections/:id/close

PATCH

/elections/:id/results

PATCH

/elections/:id/archive

---

# 8. Candidate APIs

GET

/candidates

/candidates/:id

/candidates/my-profile

POST

/candidates

PATCH

/candidates/:id

DELETE

/candidates/:id

PATCH

/candidates/:id/submit

PATCH

/candidates/:id/approve

PATCH

/candidates/:id/reject

PATCH

/candidates/:id/withdraw

PATCH

/candidates/:id/disqualify

---

# 9. Manifesto APIs

GET

/manifestos

/manifestos/:id

POST

/manifestos

PATCH

/manifestos/:id

DELETE

/manifestos/:id

PATCH

/manifestos/:id/submit

PATCH

/manifestos/:id/approve

PATCH

/manifestos/:id/reject

GET

/candidates/:id/manifesto

---

# 10. Document APIs

POST

/documents/upload

GET

/documents

GET

/documents/:id

PATCH

/documents/:id

DELETE

/documents/:id

PATCH

/documents/:id/approve

PATCH

/documents/:id/reject

GET

/documents/download/:id

GET

/documents/history/:id

---

# 11. Voter APIs

GET

/voters

/voters/:id

POST

/voters

PATCH

/voters/:id

DELETE

/voters/:id

PATCH

/voters/:id/verify

PATCH

/voters/:id/approve

POST

/voters/import

GET

/voters/export

---

# 12. Voting APIs

GET

/voting/ballot/:electionId

POST

/voting/cast

GET

/voting/status

GET

/voting/receipt/:id

GET

/voting/verify/:hash

---

# 13. Result APIs

GET

/results

/results/:electionId

POST

/results/generate

PATCH

/results/publish

GET

/results/export/pdf

GET

/results/export/excel

---

# 14. Workflow APIs

GET

/workflows

/workflows/:id

/workflows/tasks

PATCH

/workflows/tasks/:id

PATCH

/workflows/tasks/:id/approve

PATCH

/workflows/tasks/:id/reject

POST

/workflows/comments

---

# 15. Notification APIs

GET

/notifications

PATCH

/notifications/read

PATCH

/notifications/read-all

DELETE

/notifications/:id

---

# 16. Audit APIs

GET

/audit

GET

/audit/:id

GET

/audit/export

GET

/audit/login-history

---

# 17. Report APIs

GET

/reports

POST

/reports/generate

GET

/reports/download/:id

DELETE

/reports/:id

---

# 18. Configuration APIs

GET

/settings

PATCH

/settings

GET

/settings/features

PATCH

/settings/features

---

# 19. Public APIs

GET

/public/elections

/public/elections/:id

/public/candidates

/public/candidates/:id

/public/manifestos

/public/results

/public/statistics

/public/verify/:hash

---

# 20. Dashboard APIs

GET

/dashboard/admin

/dashboard/commissioner

/dashboard/candidate

/dashboard/voter

/dashboard/auditor

---

# 21. Security

Every endpoint supports

JWT Authentication

RBAC

DTO Validation

Input Sanitization

Rate Limiting

Audit Logging

---

# 22. API Versioning

Version 1

/api/v1

Future

/api/v2

/api/v3

---

# 23. Future APIs

AI

/ai/predictions

/ai/fraud-detection

Blockchain

/blockchain/verify

/blockchain/status

Organizations

/organizations

Workflow Designer

/workflow-builder

---

# REST Principles

- Resource Based URLs
- Stateless Requests
- Consistent Responses
- Proper Status Codes
- Versioned APIs
- Secure by Default

---

# HTTP Status Codes

200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Failed

500 Internal Server Error

---

# Document Approval

| Version | Date | Author | Status |
|----------|------|--------|--------|
| 1.0 | July 2026 | Shahid Irfan Hussain | Approved |