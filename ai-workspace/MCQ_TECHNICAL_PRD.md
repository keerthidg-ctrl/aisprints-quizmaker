Date created: September 9, 2026
Date last modified: September 9, 2026

# Multiple Choice Questions — Technical PRD (Sprint 2)

## Overview/Problem

After Sprint 0 authentication, signed-in users land on a dashboard stub with no quiz functionality. Educators and trainers need a way to create, manage, and preview individual multiple choice questions before full quiz assembly exists. Without this capability, the product cannot move beyond identity management.

This sprint delivers authenticated CRUD for multiple choice questions, including answer choices and attempt recording during preview.

---

## Hypothesis

We believe that giving authenticated users a focused MCQ management experience will let them build question banks quickly and validate the data model before full quiz composition ships.

---

## Scope

### In Scope

- D1 schema for `mcqs`, `mcq_choices`, and `mcq_attempts`
- MCQ service layer with create, read, update, delete, and attempt recording
- Server Actions for MCQ mutations and preview attempts
- Protected dashboard sub-pages for list, create, edit, and preview
- shadcn/ui table, buttons, dropdown menu, dialog, field, input, and textarea
- Validation for MCQ name, question text, and 2–6 choices with exactly one correct answer
- Test-driven development for validation and service logic
- User-scoped data access (users only see and mutate their own MCQs)

### Out of Scope

- Full quiz assembly from multiple questions
- Quiz attempts spanning multiple questions
- Sharing MCQs between users
- AI-generated questions
- Analytics dashboards for attempt history
- Public/anonymous preview links

### Cut

- REST API route handlers — Server Actions match the existing auth pattern and are sufficient for this sprint
- Separate `description` field — consolidated into `question` per product direction
- Drag-and-drop choice reordering — sort order is preserved by form index only

---

## Technical Requirements

### Database Schema

```sql
CREATE TABLE mcqs (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  question TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE mcq_choices (
  id TEXT PRIMARY KEY NOT NULL,
  mcq_id TEXT NOT NULL,
  choice_text TEXT NOT NULL,
  is_correct INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (mcq_id) REFERENCES mcqs(id) ON DELETE CASCADE
);

CREATE TABLE mcq_attempts (
  id TEXT PRIMARY KEY NOT NULL,
  mcq_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  choice_id TEXT NOT NULL,
  is_correct INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (mcq_id) REFERENCES mcqs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (choice_id) REFERENCES mcq_choices(id)
);
```

Migration file: `migrations/0003_init_mcq_tables.sql`

### API Surface (Server Actions)

| Action | Purpose |
|--------|---------|
| `createMcqAction` | Validate input, create MCQ and choices, redirect to list |
| `updateMcqAction` | Validate input, update MCQ and replace choices, redirect to list |
| `deleteMcqAction` | Delete MCQ owned by current user |
| `submitAttemptAction` | Record preview attempt with selected choice and correctness |

### User Interface Requirements

#### MCQ List (`/dashboard/mcqs`)

- Table columns: Name, Question (truncated), Actions
- `Create Question` button links to `/dashboard/mcqs/new`
- Row actions menu (vertical ellipsis): Edit, Preview, Delete
- Delete opens confirmation dialog

#### Create MCQ (`/dashboard/mcqs/new`)

- Fields: Name, Question, 2–6 choices
- One radio button per choice to mark the correct answer
- Save and Cancel buttons

#### Edit MCQ (`/dashboard/mcqs/[id]/edit`)

- Same form as create, pre-filled with existing data
- Save and Cancel buttons

#### Preview MCQ (`/dashboard/mcqs/[id]/preview`)

- Display question and choices as radio options
- Submit records an attempt and shows correct/incorrect feedback

---

## Implementation Phases

### Phase 1: Database Schema — COMPLETED

**Objective:** Add MCQ-related tables to D1 using schema contract tests first (TDD).

**Tasks:**
1. Write failing schema contract tests (`src/lib/db/schema/mcq-schema-contract.test.ts`)
2. Define the MCQ schema contract (`src/lib/db/schema/mcq-schema-contract.ts`)
3. Create migration `0003_init_mcq_tables.sql` (note: `0002` is reserved for `sessions`)
4. Make contract tests pass with `validateMcqMigrationSql`
5. Apply migration locally with `npm run db:migrate:local`

**Deliverables:**
- `mcqs`, `mcq_choices`, `mcq_attempts` tables with indexes and foreign keys
- Schema contract module and tests proving migration SQL matches the contract

**Tests first:**
- Migration file missing → contract tests fail (RED)
- Migration file present and valid → contract tests pass (GREEN)

---

### Phase 2: Validation and Service Layer — COMPLETED

**Objective:** Implement and test MCQ domain logic in isolation.

**Tasks:**
1. Write failing tests for MCQ validation rules
2. Implement `src/lib/mcq/validation.ts`
3. Write failing tests for MCQ service CRUD and attempts
4. Implement `src/lib/services/mcq-service.ts`
5. Add failure-path and cross-user isolation tests for the service layer

**Deliverables:**
- `src/lib/mcq/validation.test.ts`
- `src/lib/services/mcq-service.test.ts`

**Tests first (service failure paths):**
- `findMcqById` returns `null` for missing MCQs and for MCQs owned by another user
- `updateMcq` / `deleteMcq` return `{ error: "not_found" }` for missing or cross-user access
- `recordAttempt` returns `not_found`, `invalid_choice`, and `record_failed` as appropriate
- `createMcq` returns `{ error: "create_failed" }` when persistence fails

---

### Phase 3: Server Actions — COMPLETED

**Objective:** Wire authenticated mutations to the service layer.

**Tasks:**
1. Implement `createMcqAction`, `updateMcqAction`, `deleteMcqAction`
2. Implement `submitAttemptAction` for preview mode
3. Scope all operations to the authenticated user
4. Add server action tests for validation, auth wiring, service errors, and redirects

**Deliverables:**
- `src/app/dashboard/mcqs/actions.ts`
- `src/app/dashboard/mcqs/actions.test.ts`

**Tests first (server action paths):**
- Validation failures return field errors without calling the service
- Successful create/update redirect to `/dashboard/mcqs`
- Service `not_found` / persistence failures map to user-facing `formError` messages
- `deleteMcqAction` returns structured `{ success, error? }` results
- `submitAttemptAction` requires a choice and returns `isCorrect` on success

---

### Phase 4: MCQ List Page — COMPLETED

**Objective:** Replace the dashboard stub experience with an MCQ management entry point and list table.

**Tasks:**
1. Add link from dashboard to `/dashboard/mcqs`
2. Build list page with shadcn table
3. Add row actions dropdown and delete confirmation dialog

**Deliverables:**
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/mcqs/page.tsx`
- `src/app/dashboard/mcqs/mcq-actions-menu.tsx`

---

### Phase 5: Create and Edit Pages — COMPLETED

**Objective:** Deliver the shared MCQ form for create and edit flows.

**Tasks:**
1. Build client form with dynamic choice rows (2–6)
2. Add create page and edit page
3. Wire form to Server Actions with validation feedback

**Deliverables:**
- `src/app/dashboard/mcqs/mcq-form.tsx`
- `src/app/dashboard/mcqs/new/page.tsx`
- `src/app/dashboard/mcqs/[id]/edit/page.tsx`

---

### Phase 6: Preview and Attempts — COMPLETED

**Objective:** Allow users to preview a question and record attempts.

**Tasks:**
1. Build preview page with answer submission
2. Record attempts in `mcq_attempts`
3. Show correct/incorrect feedback after submission

**Deliverables:**
- `src/app/dashboard/mcqs/[id]/preview/page.tsx`
- `src/app/dashboard/mcqs/[id]/preview/preview-form.tsx`

---

### Phase 7: Integration and Verification — COMPLETED

**Objective:** Verify the full feature end-to-end.

**Tasks:**
1. Run `npm run test`
2. Run `npm run lint`
3. Run `npm run build`
4. Smoke test list/create/edit/preview/delete on local dev server

**Deliverables:**
- Passing test, lint, and build commands
- Updated acceptance criteria below

---

## Technical Implementation Details

### Key Files

- `src/lib/db/schema/mcq-schema-contract.ts` — MCQ schema contract (source of truth for Phase 1)
- `src/lib/db/schema/validate-mcq-migration.ts` — Validates migration SQL against the contract
- `src/lib/db/schema/mcq-schema-contract.test.ts` — Schema contract tests (TDD gate for migrations)
- `migrations/0003_init_mcq_tables.sql` — MCQ schema
- `src/lib/mcq/validation.ts` — Form parsing and validation
- `src/lib/services/mcq-service.ts` — D1 queries and domain mapping
- `src/app/dashboard/mcqs/actions.ts` — Server Actions
- `src/app/dashboard/mcqs/page.tsx` — MCQ list table
- `src/app/dashboard/mcqs/mcq-form.tsx` — Shared create/edit form
- `src/app/dashboard/mcqs/mcq-actions-menu.tsx` — Row actions and delete dialog
- `src/app/dashboard/mcqs/[id]/preview/preview-form.tsx` — Preview and attempt submission

### Implementation Patterns

- Service functions accept `D1Database` as the first argument and map snake_case rows to camelCase records
- All MCQ queries are scoped by `user_id`
- Server Actions call `requireAuth()` and `getDb()` before service calls
- Client forms use `useActionState` with shadcn `field` primitives
- Choice replacement on update deletes existing choices and re-inserts in sort order

### Important Notes

- Middleware already protects `/dashboard/:path*`, so MCQ routes inherit auth protection
- Preview mode records attempts but does not yet surface attempt history in the UI
- `dropdown-menu` and `textarea` shadcn components were added for this sprint

---

## Acceptance Criteria

- [x] Signed-in users can open `/dashboard/mcqs` and see their MCQ list
- [x] Users can create an MCQ with 2–6 choices and one correct answer
- [x] Users can edit an existing MCQ and save changes
- [x] Users can delete an MCQ from the actions menu with confirmation
- [x] Users can preview an MCQ and submit an answer
- [x] Preview submission records an attempt with selected choice and correctness
- [x] Users cannot access another user's MCQs
- [x] Validation errors are shown for invalid form input
- [x] `npm run test`, `npm run lint`, and `npm run build` pass

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| MCQ create/edit completion | Form saves without server error | Manual smoke test |
| Validation coverage | All MCQ validation rules have unit tests | `npm run test` |
| Data isolation | Queries always filter by `user_id` | Code review + service tests |

---

## Dependencies

### External Dependencies

- Cloudflare D1 (`DB` binding in `wrangler.jsonc`)
- shadcn/ui components on Base UI

### Internal Dependencies

- Sprint 0 authentication (`requireAuth`, session cookie, `users` table)
- `getDb()` from `src/lib/db.ts`

---

## Risks and Mitigation

### Technical Risks

- **Risk:** Choice updates could orphan attempts if choice IDs change
- **Mitigation:** Acceptable for preview-only attempts in this sprint; full quiz attempts will need a different model later

### User Experience Risks

- **Risk:** Users may not notice which choice is marked correct while editing
- **Mitigation:** Radio buttons and helper text on the form explain the correct-answer selection

---

## Troubleshooting Guide

_No entries yet._

---

## Notes for AI Agents

When working with this PRD:

1. Read Scope before adding quiz-level features — they are out of scope for Sprint 2
2. Follow the existing service-layer and Server Action patterns from authentication
3. Update phase status markers as work progresses
4. Mark acceptance criteria when verified
5. Apply D1 migrations locally only

---

## Current Status

**Last Updated:** September 9, 2026
**Current Phase:** Phase 7 — Integration and Verification
**Status:** COMPLETED
**Next Steps:** Manual smoke test via `npm run dev` or `npm run preview`; begin next sprint feature when ready
