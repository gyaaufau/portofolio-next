# [Feature Name]

## Purpose

[ONE OR TWO SENTENCES DESCRIBING USER VALUE.]

---

## Ownership

This feature owns:

- [BEHAVIOR]
- [STATE]
- [DATA OR FLOW]

This feature does not own:

- [BOUNDARY]
- [BOUNDARY]

Related features:

- `[Feature]` — [RELATIONSHIP]
- `[Feature]` — [RELATIONSHIP]

---

## Terminology

Use canonical terms from `CONTEXT.md`.

Feature-specific terms:

### [Term]

[SHORT DEFINITION.]

---

## Entry Points

The feature can be entered from:

- [ENTRY POINT]
- [ENTRY POINT]

Primary route(s):

```text
[ROUTE]
```

---

## User Flow

```text
[ENTRY]
→ [STEP]
→ [STEP]
→ [SUCCESS / EXIT]
```

---

## State Lifecycle

State owner:

```text
[STATE OWNER]
```

Lifecycle:

```text
initial
→ loading
→ success
→ failure
```

Important state rules:

- [RULE]
- [RULE]

Long-lived state:

[WHAT SURVIVES NAVIGATION OR RESTART, IF ANY.]

---

## Data Flow

```text
Page / Interface
→ State Owner
→ Repository / Service
→ Data Source
→ Source of Truth
```

Primary models:

| Model / Concept | Purpose |
|---|---|
| [Model] | [Purpose] |

---

## Persistence

Source of truth:

`[SYSTEM]`

Local/cache behavior:

`[BEHAVIOR]`

Remote behavior:

`[BEHAVIOR]`

Write rules:

- [RULE]
- [RULE]

Read rules:

- [RULE]
- [RULE]

Detailed schema belongs in `docs/data/`.

---

## External Integrations

- `[Integration]` — [WHY USED]

Detailed integration contracts belong in `docs/integrations/`.

---

## Failure and Edge Cases

| Case | Expected Behavior |
|---|---|
| [Failure] | [Behavior] |
| [Empty state] | [Behavior] |
| [Offline] | [Behavior] |
| [Unauthorized] | [Behavior] |

---

## UI Ownership

Pages/screens:

- [PAGE]

Feature-owned components:

- [COMPONENT]

Shared components used:

- [SHARED COMPONENT]

---

## Testing Priorities

Prioritize:

- [STATE TRANSITION]
- [SAVE/LOAD BEHAVIOR]
- [VALIDATION]
- [CRITICAL FLOW]
- [ERROR HANDLING]

---

## Known Limitations

- [LIMITATION]
- [LIMITATION]

---

## Where to Change

| Change | Primary Location |
|---|---|
| UI | `[PATH]` |
| State | `[PATH]` |
| Data access | `[PATH]` |
| DI | `[PATH]` |
| Routing | `[PATH / navigation doc]` |

---

## Feature-Specific Agent Rules

Only add rules unique to this feature.

- [RULE]
- [RULE]

Do not repeat `AGENTS.md`.

---

## Update Rules

Update this document when:

- feature behavior changes,
- ownership changes,
- state lifecycle changes,
- data flow changes,
- persistence behavior changes,
- feature-specific constraints change.

Do not update for minor UI polish or implementation details that do not change behavior.
