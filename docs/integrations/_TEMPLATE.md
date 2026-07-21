# [Integration Name]

This document defines the boundary between the application and `[EXTERNAL SYSTEM]`.

---

## Purpose

[WHY THE PROJECT USES THIS INTEGRATION.]

---

## Ownership Boundary

Application owns:

- [RESPONSIBILITY]
- [RESPONSIBILITY]

External system/backend owns:

- [RESPONSIBILITY]
- [RESPONSIBILITY]

Do not duplicate ownership across both sides.

---

## Configuration

Environment values:

```text
[KEY NAME]
[KEY NAME]
```

Source:

[WHERE CONFIG COMES FROM.]

Never document actual secret values.

---

## Runtime Flow

```text
App
→ [CLIENT / SDK]
→ [EXTERNAL SYSTEM]
→ [RESULT]
→ [APPLICATION STATE]
```

---

## Request Contract

Inputs:

- [INPUT]
- [INPUT]

---

## Response Contract

Success:

[SHAPE / BEHAVIOR.]

Failure:

[ERROR BEHAVIOR.]

Retry:

[POLICY.]

---

## Security Boundary

Client may know:

- [PUBLIC CONFIG]

Client must not know:

- [SERVER SECRET]
- [ADMIN KEY]
- [PRIVATE TOKEN]

Server/backend owns:

- [SECRET]
- [PRIVILEGED OPERATION]

---

## Testing

Local:

[HOW TO TEST.]

Sandbox/staging:

[HOW TO TEST.]

Production smoke test:

[SAFE CHECK.]

---

## Known Limitations

- [LIMITATION]

---

## Update Rules

Update when:

- SDK/API contract changes,
- environment setup changes,
- ownership boundary changes,
- security model changes,
- retry/error behavior changes.
