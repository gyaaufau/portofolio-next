# [Data System Name]

This document defines persistence ownership, source-of-truth rules, schema authority, migrations, synchronization, and operational setup for `[SYSTEM]`.

---

## 1. Responsibility

This system owns:

- [DATA]
- [DATA]

It does not own:

- [BOUNDARY]
- [BOUNDARY]

---

## 2. Source of Truth

Authoritative current runtime state:

```text
[BASE SCHEMA / CONFIG]
+
[APPLIED MIGRATIONS / RUNTIME CONFIGURATION]
=
CURRENT RUNTIME STATE
```

Secondary references:

- `[FILE]` — planning/visualization only.
- `[FILE]` — human-readable domain explanation.
- feature docs — application behavior and ownership.
- archived docs — historical context only.

When documentation conflicts with executable schema/migrations, prefer runtime state.

---

## 3. Environments

| Environment | Purpose | Config Source |
|---|---|---|
| Dev | [Purpose] | [Source] |
| Staging | [Purpose] | [Source] |
| Production | [Purpose] | [Source] |

Never commit secrets.

---

## 4. Ownership Model

| Data | Owner Key | Notes |
|---|---|---|
| [Data] | [Key] | [Notes] |

---

## 5. Read Paths

```text
[Feature]
→ [Repository]
→ [Data Source]
→ [System]
```

Important read rules:

- [RULE]
- [RULE]

---

## 6. Write Paths

```text
[Feature]
→ [Repository]
→ [Data Source]
→ [System]
```

Important write rules:

- [RULE]
- [RULE]

---

## 7. Schema and Migrations

Schema location:

```text
[PATH]
```

Migration location:

```text
[PATH]
```

Rules:

- migrations are append-only unless project policy explicitly allows otherwise,
- do not rewrite applied migrations,
- document destructive operations,
- keep seed data separate from schema changes when practical.

---

## 8. Seed and Import Data

Seed location:

```text
[PATH]
```

Import process:

```text
[COMMAND / STEPS]
```

Clarify:

- idempotency,
- conflict behavior,
- ownership of imported data.

---

## 9. Sync and Cache

Source of truth:

`[SYSTEM]`

Cache:

`[SYSTEM OR NONE]`

Sync direction:

```text
[REMOTE] → [LOCAL]
```

or

```text
[LOCAL] ↔ [REMOTE]
```

Conflict strategy:

[DESCRIBE.]

Offline behavior:

[DESCRIBE.]

---

## 10. Security

Authentication:

[DESCRIBE.]

Authorization:

[DESCRIBE.]

Row-level or resource-level access:

[DESCRIBE.]

Secrets:

[WHERE THEY LIVE.]

Do not describe secret values.

---

## 11. Operational Checks

```sh
[COMMAND]
[COMMAND]
```

Smoke tests:

- [CHECK]
- [CHECK]

---

## 12. Known Limitations

- [LIMITATION]
- [LIMITATION]

---

## 13. Update Rules

Update this file when:

- source-of-truth rules change,
- ownership changes,
- schema authority changes,
- migrations change application behavior,
- synchronization changes,
- environment setup changes.
