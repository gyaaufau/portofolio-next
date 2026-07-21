# Documentation Guide

This directory stores project knowledge by responsibility.

The goal is selective context loading: read only the documents needed for the current task.

---

## Document Responsibilities

| Document | Responsibility |
|---|---|
| `../AGENTS.md` | Invariant implementation and workflow guardrails |
| `../CONTEXT.md` | Shared domain language and boundaries |
| `architecture.md` | Global technical architecture |
| `navigation.md` | Route topology and cross-feature flows |
| `features/*.md` | Feature behavior, ownership, state, contracts, and limitations |
| `data/*.md` | Persistence, schema authority, migration, sync, and data-source rules |
| `integrations/*.md` | External service boundaries and operational contracts |
| `decisions/*.md` | Durable architecture decisions and rationale |
| `archive/*` | Historical context only |

---

## Context Loading

Normal feature task:

```text
AGENTS.md
→ relevant feature doc
→ relevant code
```

Read `CONTEXT.md` when terminology or cross-domain relationships are unclear.

Routing task:

```text
AGENTS.md
→ relevant feature docs
→ navigation.md
→ relevant code
```

Persistence/data task:

```text
AGENTS.md
→ relevant feature doc
→ relevant data doc
→ schema/migrations/runtime configuration
→ relevant code
```

Integration task:

```text
AGENTS.md
→ relevant feature doc
→ relevant integration doc
→ relevant code/configuration
```

Global architecture task:

```text
AGENTS.md
→ CONTEXT.md
→ architecture.md
→ affected feature docs
→ relevant code
```

Do not load unrelated documentation by default.

---

## Source-of-Truth Principle

Prefer:

1. current runtime behavior,
2. executable schema/migrations/configuration,
3. current feature contracts,
4. architecture documentation,
5. planning artifacts,
6. historical reports.

When sources conflict, report the conflict rather than silently guessing.

---

## Writing Rules

Documentation should:

- store knowledge that is expensive to rediscover,
- have one clear owner,
- avoid duplicating other documents,
- describe current behavior unless explicitly historical,
- stay concise enough to be useful as agent context.

Do not use docs as a daily progress log.
