# Dynamic Voter Eligibility Engine

> Status: implemented (backend). Covers Sec4 of the BallotTrust master
> build prompt.

## What it replaces

Before this, any authenticated user with `role = VOTER` could vote in any
`ACTIVE` election — eligibility wasn't modeled at all. This engine lets
an election define arbitrary AND/OR/NOT eligibility rules over a
whitelisted set of voter attributes, enforced at vote-cast time.

## Rule tree shape

A rule is a tree of four node types:

```ts
type RuleNode =
  | { type: 'CONDITION'; condition: EligibilityCondition }
  | { type: 'AND'; rules: RuleNode[] }
  | { type: 'OR'; rules: RuleNode[] }
  | { type: 'NOT'; rule: RuleNode };

interface EligibilityCondition {
  field: 'department' | 'course' | 'year' | 'semester' | 'role' | 'status';
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'exists';
  value?: unknown;
}
```

Worked example from the spec — `(Department = CSE OR ECE) AND Year >= 2
AND Status = APPROVED`:

```json
{
  "type": "AND",
  "rules": [
    { "type": "OR", "rules": [
      { "type": "CONDITION", "condition": { "field": "department", "operator": "eq", "value": "CSE" } },
      { "type": "CONDITION", "condition": { "field": "department", "operator": "eq", "value": "ECE" } }
    ] },
    { "type": "CONDITION", "condition": { "field": "year", "operator": "gte", "value": 2 } },
    { "type": "CONDITION", "condition": { "field": "status", "operator": "eq", "value": "APPROVED" } }
  ]
}
```

## Field whitelist

Only `department`, `course`, `year`, `semester`, `role`, `status` may be
referenced — enforced by `EligibilityRuleValidator`, which rejects any
other field (e.g. `password`, `email`) before a rule tree is ever
persisted. Extending the whitelist means updating
`eligibility/types.ts::ELIGIBILITY_FIELDS`, deliberately in one place.

The validator also rejects: unknown operators, numeric operators (`gt`/
`gte`/`lt`/`lte`) paired with a non-numeric value, list operators (`in`/
`nin`) paired with a non-array value, empty `AND`/`OR` branches, rule
trees deeper than 8 levels, and `AND`/`OR` nodes with more than 20
branches — the tree is untrusted admin input and shouldn't be able to
degrade evaluation performance or reference disallowed fields.

## Default behavior (stated assumption)

If an election has **no** `EligibilityRuleSet` defined yet,
`GetActiveEligibilityRulesService`/`CheckVoterEligibilityService` fall
back to an implicit default:

```
role = VOTER AND status = APPROVED
```

This preserves pre-engine behavior so existing elections don't silently
break the moment this shipped — it's the same effective eligibility that
was enforced before Sec4 existed (any approved voter).

## Versioning

Editing rules never mutates a row — `DefineEligibilityRulesService`
always creates a **new** `EligibilityRuleSet` version and deactivates the
previous one, inside one transaction (`EligibilityRuleSetRepository.
createNewVersion`). There is never a moment with two active versions, and
every past version stays queryable via `GET .../eligibility/rules/versions`
so a historical evaluation can always be explained against the exact
rule set that produced it.

## Explainability & the snapshot record

Every evaluation — whether triggered by a real vote-cast attempt, an
admin's single-voter check, or a bulk preview — goes through
`CheckVoterEligibilityService`/`BulkCheckEligibilityService`, which:

1. Evaluates the rule tree against the voter's attributes via
   `EligibilityEvaluatorService`, producing a boolean result **and** an
   explanation tree that mirrors the rule structure node-by-node (each
   `CONDITION` leaf reports the field, operator, expected value, actual
   value, and whether it passed).
2. Persists the result as a `VoterEligibilitySnapshot` row.

This means there's no separate "eligibility snapshot" batch step to
remember to run — every check is self-recording, and "why was voter X
eligible/ineligible for election Y at time Z" is always answerable from
`VoterEligibilitySnapshot` without re-deriving it from mutable state.

## Enforcement point

`VoteService.castVote` calls `CheckVoterEligibilityService.execute()`
after confirming the election is `ACTIVE` and before issuing/consuming a
`VoterCredential`. An ineligible voter gets a terse 403
(`ForbiddenException`) — the full explanation isn't inlined into the
error response, but is queryable immediately after via
`GET /elections/:electionId/eligibility/me`.

## API surface

All routes are under `/elections/:electionId/eligibility`:

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/rules` | SUPER_ADMIN, ELECTION_COMMISSIONER | Define a new rule version |
| GET | `/rules` | + AUDITOR | Active rule set (or the implicit default) |
| GET | `/rules/versions` | + AUDITOR | Full version history |
| GET | `/me` | any authenticated user | Check + explain your own eligibility |
| GET | `/check/:userId` | SUPER_ADMIN, ELECTION_COMMISSIONER, AUDITOR | Check + explain a specific voter's eligibility |
| GET | `/bulk` | SUPER_ADMIN, ELECTION_COMMISSIONER | Evaluate every VOTER, for turnout preview before voting opens |

## What this does *not* yet cover

- **Bulk evaluation is in-process**, not paginated/streamed. Fine at
  typical institution scale; the spec's 1M-voter load-testing target
  (Phase 10) would need this reworked — flagged, not silently dropped.
- **No rule-builder UI** — this pass is backend-only (API + validation +
  evaluation + persistence). A frontend rule builder would consume the
  same `POST /rules` endpoint.
- **Custom/free-form rules beyond the whitelist** (the spec mentions
  "custom rules" generically) aren't supported — only the six whitelisted
  attributes. Extending this is additive (grow `ELIGIBILITY_FIELDS`), not
  architectural.
