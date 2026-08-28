Date created: August 28, 2026
Date last modified: August 28, 2026

# aisprint-quizmaker — Technical PRD (Sprint 0: Authentication)

## Project Overview

**aisprint-quizmaker** is a web application that will allow users to create quizzes, manage quizzes, attempt quizzes, and view their results. The long-term product serves educators, trainers, and learners who need a simple platform to build and take assessments online.

This document is the **Technical Product Requirements Document (Technical PRD)** for the project. It is the single source of truth for developers and AI agents during all future sprints.

**Current focus:** Sprint 0 covers **authentication only**. No quiz-related features are in scope for this sprint. The authentication module must be designed and specified completely before any implementation begins.

**Target platform:** Next.js 16 (App Router), React 19, TypeScript (strict mode), Tailwind CSS v4, shadcn/ui, hosted on Cloudflare Workers via `@opennextjs/cloudflare`.

---

## Business Goal

Provide a secure, reliable identity layer so that every future feature in aisprint-quizmaker can be tied to an authenticated user. Without authentication, users cannot safely create quizzes, track attempts, or view personal results.

**Business outcomes for Sprint 0:**

- Users can register and sign in with confidence that their account is protected.
- The application can distinguish authenticated users from anonymous visitors.
- Future sprints can build quiz features on top of a stable session and route-protection model.
- The team establishes a test-driven development (TDD) discipline from the first sprint, reducing rework and regression risk as the product grows.

---

## Hypothesis

We believe that delivering a well-tested authentication module first will give aisprint-quizmaker a secure foundation and allow subsequent quiz features to ship faster with fewer security-related defects.

---

## Sprint Goal (Sprint 0)

**Sprint 0 is a design-and-specification sprint.** The goal is to fully define the authentication feature before development starts.

### In Scope for Sprint 0

- User Sign Up
- User Sign In
- Logout
- User Session Management
- Protected Routes
- Basic authentication flow (end-to-end user journey from registration through login, session persistence, and logout)

### Sprint 0 Deliverable

This Technical PRD — complete, reviewed, and agreed upon — plus phased implementation plans that follow TDD. **No application code is written during Sprint 0.**

---

## Scope

### In Scope

| Area | Description |
|------|-------------|
| Sign Up | Registration with Full Name, Email, Password, Confirm Password |
| Sign In | Login with Email and Password |
| Logout | End session and redirect to Sign In |
| Session Management | Persist authenticated state until logout or session expiry |
| Protected Routes | Block unauthenticated access; redirect to Sign In |
| Dashboard (placeholder) | Minimal post-login landing page to confirm successful authentication |
| Validation & messaging | Field-level and form-level errors; success feedback where applicable |
| TDD approach | Tests written before implementation in each development phase |

### Out of Scope

The following are **explicitly excluded** from Sprint 0 and this PRD's implementation phases:

- Quiz creation, editing, or deletion
- Quiz management (lists, categories, sharing)
- Quiz attempts and scoring
- Reports, analytics, or result history
- Password reset or "Forgot Password"
- Email verification after sign up
- Social login (Google, GitHub, etc.)
- Multi-factor authentication (MFA)
- Role-based access control (admin vs. user)
- User profile editing or avatar upload
- Account deletion or deactivation
- Remember-me / persistent login beyond standard session
- Rate limiting and CAPTCHA (may be added later)
- Internationalization (i18n)

### Cut (Considered but Deliberately Removed)

| Item | Reason |
|------|--------|
| Email verification on sign up | Adds email service dependency; deferred to a future sprint |
| OAuth / social sign-in | Increases integration complexity; email/password is sufficient for MVP auth |
| MFA | Not required for initial launch; can be added when security requirements tighten |
| Rich user profile | Authentication sprint needs identity only; profile fields beyond name are future work |

---

## User Flow

### New User (Registration → Sign In → Dashboard)

```
[Landing / Sign Up page]
        │
        ▼
  Fill registration form
  (Name, Email, Password, Confirm Password)
        │
        ├── Validation fails ──► Show field errors, stay on Sign Up
        │
        └── Validation passes ──► Create account
                    │
                    ▼
            Show success message
                    │
                    ▼
            Redirect to Sign In page
                    │
                    ▼
            Enter Email + Password
                    │
                    ├── Invalid credentials ──► Show error, stay on Sign In
                    │
                    └── Valid credentials ──► Create session
                                │
                                ▼
                        Redirect to Dashboard
```

### Returning User (Sign In → Dashboard)

```
[Sign In page]
        │
        ▼
  Enter Email + Password
        │
        ├── Invalid credentials ──► Show error message
        │
        └── Valid credentials ──► Restore or create session
                    │
                    ▼
            Redirect to Dashboard
```

### Authenticated User (Session Active)

```
[Dashboard or any protected page]
        │
        ├── Session valid ──► Page renders normally
        │
        └── Session invalid / expired ──► Redirect to Sign In
```

### Logout

```
[Any authenticated page]
        │
        ▼
  User clicks Logout
        │
        ▼
  Session cleared
        │
        ▼
  Redirect to Sign In page
```

### Unauthenticated Access Attempt

```
[Protected route — e.g. Dashboard]
        │
        ▼
  No valid session detected
        │
        ▼
  Redirect to Sign In page
        (Optional: preserve intended destination for post-login redirect — see Open Questions)
```

---

## User Stories

### Sign Up

| ID | Story | Priority |
|----|-------|----------|
| US-01 | As a new user, I want to register with my full name, email, and password so that I can create an account and use the application. | Must Have |
| US-02 | As a new user, I want to see clear validation errors when I enter invalid or missing information so that I can correct my input. | Must Have |
| US-03 | As a new user, I want to be told if my email is already registered so that I know to sign in instead. | Must Have |
| US-04 | As a new user, I want to confirm my password during registration so that I do not mistype my password. | Must Have |
| US-05 | As a new user, I want to be redirected to the Sign In page after successful registration so that I can log in with my new credentials. | Must Have |

### Sign In

| ID | Story | Priority |
|----|-------|----------|
| US-06 | As a registered user, I want to sign in with my email and password so that I can access my account. | Must Have |
| US-07 | As a registered user, I want to see a meaningful error when my credentials are wrong so that I know login failed without exposing sensitive details. | Must Have |
| US-08 | As a registered user, I want to be redirected to the Dashboard after successful login so that I can use the application. | Must Have |
| US-09 | As a registered user, I want my session to persist across page refreshes and navigation until I log out so that I do not have to sign in repeatedly. | Must Have |

### Logout

| ID | Story | Priority |
|----|-------|----------|
| US-10 | As a signed-in user, I want to log out so that my session ends on shared or private devices. | Must Have |
| US-11 | As a signed-in user, I want to be redirected to the Sign In page after logout so that I know I am no longer authenticated. | Must Have |

### Protected Routes

| ID | Story | Priority |
|----|-------|----------|
| US-12 | As an unauthenticated visitor, I want to be redirected to Sign In when I try to access protected pages so that private content stays private. | Must Have |
| US-13 | As an authenticated user, I want to access protected pages without being asked to sign in again so that my experience is seamless. | Must Have |

### Navigation

| ID | Story | Priority |
|----|-------|----------|
| US-14 | As a visitor, I want a link from Sign In to Sign Up (and vice versa) so that I can switch between registration and login easily. | Must Have |

---

## Functional Requirements

### FR-1: Sign Up

| ID | Requirement |
|----|-------------|
| FR-1.1 | The system shall provide a Sign Up page accessible to unauthenticated users. |
| FR-1.2 | The Sign Up form shall collect: Full Name, Email Address, Password, Confirm Password. |
| FR-1.3 | All Sign Up fields are required. Empty submission shall trigger validation errors. |
| FR-1.4 | Email shall be validated for correct format before submission. |
| FR-1.5 | Email shall be unique across all registered users. Duplicate email shall be rejected. |
| FR-1.6 | Password shall meet complexity rules (see Validation Rules). |
| FR-1.7 | Confirm Password shall exactly match Password. |
| FR-1.8 | On successful registration, the system shall display a success message and redirect the user to the Sign In page. |
| FR-1.9 | Passwords shall never be stored in plain text. |
| FR-1.10 | The system shall not automatically sign in the user after registration; the user must sign in explicitly. |

### FR-2: Sign In

| ID | Requirement |
|----|-------------|
| FR-2.1 | The system shall provide a Sign In page accessible to unauthenticated users. |
| FR-2.2 | The Sign In form shall collect: Email, Password. |
| FR-2.3 | Both fields are required. |
| FR-2.4 | The system shall validate credentials against stored user records. |
| FR-2.5 | On invalid credentials, the system shall display a generic error message (see Error Messages) without revealing whether the email exists. |
| FR-2.6 | On successful login, the system shall create a user session and redirect to the Dashboard. |
| FR-2.7 | The session shall remain active until the user logs out or the session expires (see Session Management). |

### FR-3: Logout

| ID | Requirement |
|----|-------------|
| FR-3.1 | Authenticated users shall have a visible Logout action (e.g. button or menu item). |
| FR-3.2 | Logout shall invalidate the current session completely. |
| FR-3.3 | After logout, the user shall be redirected to the Sign In page. |
| FR-3.4 | After logout, accessing protected routes shall require signing in again. |

### FR-4: Session Management

| ID | Requirement |
|----|-------------|
| FR-4.1 | The system shall maintain an authenticated session after successful Sign In. |
| FR-4.2 | The session shall survive full page reloads and in-app navigation. |
| FR-4.3 | The session shall include sufficient identity information to recognize the logged-in user (at minimum: user identifier and display name). |
| FR-4.4 | Session tokens or cookies shall be handled securely (see Security Requirements). |
| FR-4.5 | Expired or invalid sessions shall be treated as unauthenticated. |

### FR-5: Protected Routes

| ID | Requirement |
|----|-------------|
| FR-5.1 | The Dashboard and any future authenticated pages shall be protected. |
| FR-5.2 | Unauthenticated requests to protected routes shall redirect to the Sign In page. |
| FR-5.3 | Authenticated users shall access protected routes without additional login prompts. |
| FR-5.4 | Sign Up and Sign In pages should redirect authenticated users away (e.g. to Dashboard) to avoid confusion. |

### FR-6: Dashboard (Authentication Placeholder)

| ID | Requirement |
|----|-------------|
| FR-6.1 | A minimal Dashboard page shall exist as the post-login destination. |
| FR-6.2 | The Dashboard shall display a welcome message including the user's name. |
| FR-6.3 | The Dashboard shall provide access to Logout. |
| FR-6.4 | The Dashboard shall not include quiz functionality in Sprint 0. |

---

## Non-Functional Requirements

### NFR-1: Security

| ID | Requirement |
|----|-------------|
| NFR-1.1 | Passwords must be hashed with a strong, industry-standard algorithm before storage. |
| NFR-1.2 | Session identifiers must be unpredictable and resistant to tampering. |
| NFR-1.3 | Authentication secrets (session signing keys, etc.) must not appear in source code or version control. |
| NFR-1.4 | HTTPS must be enforced in production. |
| NFR-1.5 | Login failure messages must not disclose whether an email is registered (prevent user enumeration). |
| NFR-1.6 | Forms must be protected against common web vulnerabilities (CSRF where applicable, XSS via output encoding). |
| NFR-1.7 | Session cookies must use appropriate flags (`HttpOnly`, `Secure` in production, `SameSite`). |

### NFR-2: Performance

| ID | Requirement |
|----|-------------|
| NFR-2.1 | Sign In and Sign Up form submission should complete within 2 seconds under normal network conditions. |
| NFR-2.2 | Protected route checks should not add perceptible delay to page loads (< 100 ms server-side overhead target). |
| NFR-2.3 | Client-side validation should provide immediate feedback without a server round trip. |

### NFR-3: Scalability

| ID | Requirement |
|----|-------------|
| NFR-3.1 | Authentication logic shall be stateless or externally store session data so the app can scale on Cloudflare Workers. |
| NFR-3.2 | User lookup by email shall be efficient at expected MVP user volumes (indexed email field when persistence layer is implemented). |
| NFR-3.3 | The authentication module shall be designed so quiz features can be added without rewriting the auth layer. |

### NFR-4: Accessibility

| ID | Requirement |
|----|-------------|
| NFR-4.1 | All form fields shall have associated visible labels. |
| NFR-4.2 | Error messages shall be announced to assistive technologies (e.g. `aria-live` regions or described-by associations). |
| NFR-4.3 | Forms shall be fully keyboard-navigable (Tab order, Enter to submit). |
| NFR-4.4 | Color contrast shall meet WCAG 2.1 AA for text and interactive elements. |
| NFR-4.5 | Focus indicators shall be visible on all interactive elements. |

### NFR-5: Responsive Design

| ID | Requirement |
|----|-------------|
| NFR-5.1 | Sign Up, Sign In, and Dashboard pages shall be usable on mobile (320px+), tablet, and desktop viewports. |
| NFR-5.2 | Forms shall remain readable and tappable without horizontal scrolling on mobile. |
| NFR-5.3 | Layout shall adapt gracefully; no critical actions hidden on smaller screens. |

### NFR-6: Maintainability

| ID | Requirement |
|----|-------------|
| NFR-6.1 | Authentication logic shall be separated from UI presentation (clean separation of concerns). |
| NFR-6.2 | Validation rules shall be defined in one place and reused across client and server. |
| NFR-6.3 | All authentication behavior shall be covered by automated tests (see TDD section). |
| NFR-6.4 | Code shall follow existing project conventions (TypeScript strict mode, `@/` imports, ESLint). |

### NFR-7: Clean Architecture

| ID | Requirement |
|----|-------------|
| NFR-7.1 | Domain concepts (User, Session, Credentials) shall be expressed clearly and not leak framework details into business logic. |
| NFR-7.2 | External dependencies (database, session store, password hashing library) shall be abstracted behind interfaces so they can be swapped or mocked in tests. |
| NFR-7.3 | Route protection shall be implemented as a reusable mechanism applicable to any future protected page. |
| NFR-7.4 | Error handling shall be consistent: validation errors, authentication errors, and system errors each follow a predictable pattern. |

---

## UI Requirements

### General UI Principles

- Use shadcn/ui components and Tailwind CSS v4 consistent with the AISprints starter (`base-nova` style).
- Pages shall be centered, clean, and focused on a single primary action (sign up or sign in).
- Show inline validation errors below the relevant field.
- Disable the submit button while a form submission is in progress to prevent double submission.
- Loading state shall be indicated during async operations (e.g. spinner or button loading state).

---

### Sign Up Page

**Route:** `/sign-up` (or equivalent — exact path decided during implementation)

**Page elements:**

| Element | Description |
|---------|-------------|
| Page title | "Create your account" or similar |
| Full Name field | Text input |
| Email Address field | Email input |
| Password field | Password input (masked) |
| Confirm Password field | Password input (masked) |
| Submit button | "Sign Up" or "Create Account" |
| Secondary link | "Already have an account? Sign In" → navigates to Sign In |

---

### Sign In Page

**Route:** `/sign-in` (or equivalent)

**Page elements:**

| Element | Description |
|---------|-------------|
| Page title | "Sign in to your account" or similar |
| Email field | Email input |
| Password field | Password input (masked) |
| Submit button | "Sign In" |
| Secondary link | "Don't have an account? Sign Up" → navigates to Sign Up |

---

### Dashboard Page (Placeholder)

**Route:** `/dashboard`

**Page elements:**

| Element | Description |
|---------|-------------|
| Welcome message | "Welcome, {Full Name}" |
| Logout control | Button or link labeled "Log Out" |
| Placeholder content | Brief note that quiz features are coming in a future sprint (optional) |

---

## Input Fields

### Sign Up Fields

| Field | Type | Required | Placeholder (suggested) |
|-------|------|----------|-------------------------|
| Full Name | Text | Yes | "Enter your full name" |
| Email Address | Email | Yes | "Enter your email" |
| Password | Password | Yes | "Create a password" |
| Confirm Password | Password | Yes | "Confirm your password" |

### Sign In Fields

| Field | Type | Required | Placeholder (suggested) |
|-------|------|----------|-------------------------|
| Email | Email | Yes | "Enter your email" |
| Password | Password | Yes | "Enter your password" |

---

## Field Validation Rules

Validation shall run on the client (immediate feedback) and on the server (authoritative check).

### Full Name

| Rule | Condition | Error Message |
|------|-----------|---------------|
| Required | Field is empty or whitespace only | "Full name is required." |
| Minimum length | Fewer than 2 characters | "Full name must be at least 2 characters." |
| Maximum length | More than 100 characters | "Full name must not exceed 100 characters." |

### Email Address

| Rule | Condition | Error Message |
|------|-----------|---------------|
| Required | Field is empty | "Email is required." |
| Format | Does not match valid email pattern | "Please enter a valid email address." |
| Uniqueness (Sign Up only) | Email already registered | "An account with this email already exists. Please sign in." |

### Password

| Rule | Condition | Error Message |
|------|-----------|---------------|
| Required | Field is empty | "Password is required." |
| Minimum length | Fewer than 8 characters | "Password must be at least 8 characters." |
| Uppercase | No uppercase letter (A–Z) | "Password must contain at least one uppercase letter." |
| Lowercase | No lowercase letter (a–z) | "Password must contain at least one lowercase letter." |
| Number | No digit (0–9) | "Password must contain at least one number." |
| Special character | No special character | "Password must contain at least one special character." |

**Special characters** include but are not limited to: `! @ # $ % ^ & * ( ) - _ = + [ ] { } ; : ' " , . < > ? / \ | ~ \``

### Confirm Password (Sign Up only)

| Rule | Condition | Error Message |
|------|-----------|---------------|
| Required | Field is empty | "Please confirm your password." |
| Match | Does not equal Password field | "Passwords do not match." |

### Sign In — Combined Validation

| Rule | Condition | Error Message |
|------|-----------|---------------|
| Email required | Email empty | "Email is required." |
| Email format | Invalid format | "Please enter a valid email address." |
| Password required | Password empty | "Password is required." |
| Invalid credentials | Email/password combination incorrect | "Invalid email or password. Please try again." |

---

## Error Messages

### Sign Up Errors

| Scenario | Message | Display Location |
|----------|---------|------------------|
| Missing required field | See field validation table | Below respective field |
| Invalid email format | "Please enter a valid email address." | Below Email field |
| Duplicate email | "An account with this email already exists. Please sign in." | Below Email field or form-level banner |
| Password complexity failure | See password validation table | Below Password field |
| Password mismatch | "Passwords do not match." | Below Confirm Password field |
| Server / unexpected error | "Something went wrong. Please try again later." | Form-level banner |

### Sign In Errors

| Scenario | Message | Display Location |
|----------|---------|------------------|
| Missing email | "Email is required." | Below Email field |
| Missing password | "Password is required." | Below Password field |
| Invalid credentials | "Invalid email or password. Please try again." | Form-level banner |
| Server / unexpected error | "Something went wrong. Please try again later." | Form-level banner |

### Session / Route Errors

| Scenario | Message | Display Location |
|----------|---------|------------------|
| Session expired | "Your session has expired. Please sign in again." | Sign In page banner (optional query param) |
| Unauthorized access | (Silent redirect) | Redirect to Sign In without exposing protected content |

---

## Success Messages

| Scenario | Message | Display Behavior |
|----------|---------|------------------|
| Successful registration | "Account created successfully. Please sign in." | Shown on Sign In page after redirect (banner or toast) |
| Successful login | (No persistent message required) | Redirect to Dashboard |
| Successful logout | (No message required) | Redirect to Sign In page |

---

## Navigation Flow

| From | Action | Destination |
|------|--------|-------------|
| Sign Up | Submit (success) | Sign In (with success message) |
| Sign Up | Click "Sign In" link | Sign In |
| Sign In | Submit (success) | Dashboard |
| Sign In | Click "Sign Up" link | Sign Up |
| Dashboard | Click Logout | Sign In |
| Protected route (unauthenticated) | Direct URL / navigation | Sign In |
| Sign In / Sign Up (already authenticated) | Direct URL / navigation | Dashboard |
| Application root `/` | First visit | Sign In or Sign Up (team decision — see Open Questions) |

---

## Authentication Flow

### Registration Flow

1. User navigates to Sign Up page.
2. User completes all fields and submits the form.
3. Client validates all fields; if invalid, show errors and stop.
4. Server receives registration request.
5. Server validates all fields again (authoritative).
6. Server checks email uniqueness.
7. Server hashes password and persists new user record.
8. Server responds with success.
9. Client shows success message and redirects to Sign In.

### Login Flow

1. User navigates to Sign In page.
2. User enters email and password and submits.
3. Client validates required fields and email format.
4. Server receives login request.
5. Server looks up user by email.
6. Server verifies password against stored hash.
7. If invalid: return authentication error (generic message).
8. If valid: create session, set secure session cookie/token, respond with success.
9. Client redirects to Dashboard.

### Session Verification Flow (Protected Routes)

1. User requests a protected page.
2. Middleware or server component checks for valid session.
3. If valid: render page with user context.
4. If invalid or absent: redirect to Sign In.

### Logout Flow

1. User triggers Logout action.
2. Server invalidates session (clear cookie / delete session record).
3. Client redirects to Sign In.
4. Subsequent protected route access requires new login.

---

## Security Requirements

| ID | Requirement | Rationale |
|----|-------------|-----------|
| SEC-1 | Passwords hashed with adaptive algorithm (e.g. bcrypt, Argon2, or scrypt) | Prevents plain-text exposure if data is compromised |
| SEC-2 | Minimum password complexity enforced server-side | Client validation alone is bypassable |
| SEC-3 | Generic login failure message | Prevents user enumeration attacks |
| SEC-4 | Session ID stored in HttpOnly cookie | Mitigates XSS session theft |
| SEC-5 | Secure flag on cookies in production | Ensures transmission over HTTPS only |
| SEC-6 | SameSite cookie attribute set appropriately | Mitigates CSRF |
| SEC-7 | No sensitive data in URL query strings | Prevents leakage via logs and browser history |
| SEC-8 | Authentication secrets in environment variables / Wrangler secrets | Prevents credential exposure in repo |
| SEC-9 | Server-side validation on every auth endpoint | Never trust client input |
| SEC-10 | Rate limiting on auth endpoints (future enhancement if not in Sprint 1) | Mitigates brute-force attacks |

---

## Test-Driven Development (TDD) Approach

All authentication implementation phases shall follow **Red → Green → Refactor**:

1. **Red:** Write a failing test that describes the desired behavior.
2. **Green:** Write the minimum code to make the test pass.
3. **Refactor:** Improve code quality without changing behavior; tests must still pass.

### Testing Layers

| Layer | What to Test | Examples |
|-------|--------------|----------|
| Unit tests | Validation functions, password rules, session helpers | Email format validator rejects `"not-an-email"` |
| Integration tests | Auth operations with test database or mocked persistence | Sign up persists user; duplicate email rejected |
| End-to-end tests (optional Phase 5+) | Full user journeys in browser | Register → Sign In → Dashboard → Logout |

### TDD Rules for This Project

- No production auth code without a corresponding failing test written first.
- Tests must be runnable via a single project command (e.g. `npm test` — testing framework to be added in Phase 1).
- Each user story maps to at least one automated test case.
- Acceptance criteria checkboxes are marked complete only when tests pass.
- Regression: existing tests must pass before any phase is marked COMPLETED.

---

## Implementation Phases

Each phase follows TDD. Status markers: **PLANNED** | **IN PROGRESS** | **COMPLETED**

---

### Phase 1: Project Foundation and Testing Setup — COMPLETED

**Objective:** Add dependencies and tooling required for authentication and TDD without implementing auth features yet.

**Tasks:**

1. Propose and add authentication library/approach (requires team approval per AGENTS.md).
2. Propose and add testing framework (e.g. Vitest) and test scripts.
3. Propose and add database or persistence layer for user storage (e.g. Cloudflare D1).
4. Define environment variables and document in `.dev.vars.example`.
5. Write smoke tests confirming test runner works.

**Deliverables:**

- Testing framework configured and runnable.
- Dependencies approved and installed.
- Environment variable placeholders documented.
- Phase status updated in this PRD.

**Tests first:**

- Test runner executes successfully.
- Example unit test passes.

---

### Phase 2: Validation and Domain Logic — PLANNED

**Objective:** Implement and test all validation rules and core auth domain logic in isolation.

**Tasks:**

1. Write failing tests for Full Name validation rules.
2. Implement Full Name validator; make tests pass.
3. Write failing tests for Email validation (format and required).
4. Implement Email validator; make tests pass.
5. Write failing tests for Password complexity rules.
6. Implement Password validator; make tests pass.
7. Write failing tests for Confirm Password match logic.
8. Implement Confirm Password validator; make tests pass.
9. Refactor validators for reuse between Sign Up and Sign In.

**Deliverables:**

- Complete validation module with 100% rule coverage in unit tests.
- No UI or API work in this phase.

**Tests first (examples):**

- Empty email returns required error.
- `"user@example.com"` passes format validation.
- Password without uppercase fails with correct message.
- Confirm password mismatch fails with correct message.

---

### Phase 3: Sign Up — PLANNED

**Objective:** Deliver working user registration end-to-end.

**Tasks:**

1. Write failing tests for user registration (success case).
2. Write failing tests for duplicate email rejection.
3. Write failing tests for invalid input rejection.
4. Implement user persistence and password hashing.
5. Implement Sign Up server action or API handler.
6. Build Sign Up page UI per UI Requirements.
7. Wire form to server logic with client and server validation.
8. Implement success redirect to Sign In with message.
9. Refactor and ensure all tests pass.

**Deliverables:**

- Functional Sign Up flow.
- All FR-1 requirements satisfied.
- User stories US-01 through US-05 covered by tests.

---

### Phase 4: Sign In, Session, and Logout — PLANNED

**Objective:** Deliver login, session persistence, and logout.

**Tasks:**

1. Write failing tests for successful login.
2. Write failing tests for invalid credentials.
3. Implement credential verification against stored hashes.
4. Implement session creation and secure cookie handling.
5. Build Sign In page UI per UI Requirements.
6. Write failing tests for session persistence across requests.
7. Implement logout (session invalidation).
8. Write failing tests for logout behavior.
9. Build minimal Dashboard placeholder with welcome message and Logout.

**Deliverables:**

- Functional Sign In and Logout flows.
- Session survives page reload.
- FR-2, FR-3, FR-4, FR-6 requirements satisfied.
- User stories US-06 through US-11 covered by tests.

---

### Phase 5: Protected Routes and Integration — PLANNED

**Objective:** Enforce authentication boundaries across the application.

**Tasks:**

1. Write failing tests for unauthenticated access to Dashboard (expect redirect/block).
2. Write failing tests for authenticated access to Dashboard (expect success).
3. Implement route protection middleware or equivalent.
4. Implement redirect of authenticated users away from Sign In / Sign Up.
5. End-to-end test: full journey Register → Sign In → Dashboard → Logout → blocked access.
6. Run `npm run lint` and `npm run build`; fix any issues.
7. Verify auth flow on Cloudflare Workers runtime via `npm run preview` (local).

**Deliverables:**

- All protected routes enforced.
- FR-5 requirements satisfied.
- User stories US-12 through US-14 covered by tests.
- All acceptance criteria checked.
- Phase statuses updated in this PRD.

---

### Phase 6: Hardening and Documentation — PLANNED

**Objective:** Final quality pass and handoff documentation.

**Tasks:**

1. Accessibility audit of auth pages (keyboard, labels, contrast, screen reader errors).
2. Responsive design verification on mobile, tablet, desktop.
3. Update AGENTS.md project description to reflect auth completion.
4. Update this PRD: mark phases COMPLETED, fill Technical Implementation Details section with decisions made during build.
5. Document any troubleshooting entries discovered during implementation.

**Deliverables:**

- NFR accessibility and responsive requirements verified.
- AGENTS.md and PRD current.
- Sprint 1 ready to begin (quiz features).

---

## Acceptance Criteria

### Sign Up

- [ ] User can register with Full Name, Email, Password, and Confirm Password.
- [ ] All fields show appropriate errors when empty or invalid.
- [ ] Invalid email format is rejected with a clear message.
- [ ] Password failing complexity rules is rejected with a specific message per rule.
- [ ] Confirm Password mismatch is rejected.
- [ ] Duplicate email is rejected with a clear message.
- [ ] Successful registration redirects to Sign In with a success message.
- [ ] User is not automatically logged in after registration.

### Sign In

- [ ] User can sign in with valid Email and Password.
- [ ] Invalid credentials show: "Invalid email or password. Please try again."
- [ ] Successful login redirects to Dashboard.
- [ ] Session persists after page refresh.

### Logout

- [ ] Logout clears the session.
- [ ] After logout, user is redirected to Sign In.
- [ ] After logout, Dashboard is inaccessible without signing in again.

### Protected Routes

- [ ] Unauthenticated user accessing Dashboard is redirected to Sign In.
- [ ] Authenticated user can access Dashboard.
- [ ] Authenticated user visiting Sign In or Sign Up is redirected to Dashboard.

### Non-Functional

- [ ] All validation rules covered by automated tests.
- [ ] Each user story has at least one passing test.
- [ ] Auth pages are keyboard-accessible and have visible labels.
- [ ] Auth pages render correctly on mobile and desktop.
- [ ] `npm run lint` passes with no errors.
- [ ] `npm run build` succeeds.
- [ ] Auth flow verified on Workers runtime via `npm run preview` (local environment).

---

## Assumptions

| ID | Assumption |
|----|------------|
| A-1 | Email and password is the only authentication method for the MVP auth module. |
| A-2 | A SQL-compatible database (likely Cloudflare D1) will store user records. Final choice deferred to Phase 1 with team approval. |
| A-3 | A single default user role exists (no admin/user distinction in Sprint 0). |
| A-4 | Session duration follows sensible defaults from the chosen auth library unless explicitly configured otherwise. |
| A-5 | The Dashboard is a placeholder and will be expanded in future sprints. |
| A-6 | Users access the application via modern evergreen browsers (Chrome, Firefox, Safari, Edge — latest two versions). |
| A-7 | Production deployment uses HTTPS via Cloudflare. |
| A-8 | Testing framework will be added as a new dev dependency with team approval. |
| A-9 | Full Name is display-only; it is not used as a login identifier. |
| A-10 | No email is sent during Sprint 0 auth (no verification, no welcome email). |

---

## Future Enhancements

The following are planned for later sprints, after authentication is complete:

| Enhancement | Description |
|-------------|-------------|
| Quiz creation | Build and edit quizzes with questions and answers |
| Quiz management | List, organize, publish, and delete quizzes |
| Quiz attempts | Take quizzes and submit answers |
| Results and reports | View scores and attempt history |
| Password reset | Forgot-password flow via email |
| Email verification | Confirm email ownership on sign up |
| OAuth / social login | Sign in with Google, GitHub, etc. |
| Multi-factor authentication | TOTP or SMS second factor |
| Role-based access | Admin, teacher, student roles |
| User profile management | Edit name, email, password |
| Rate limiting and CAPTCHA | Brute-force protection on auth endpoints |
| Remember me | Extended session option |
| Post-login redirect | Return user to originally requested URL after Sign In |

---

## Risks and Open Questions

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cloudflare Workers session handling differs from Node dev | Auth works locally but fails in preview/production | Test early with `npm run preview`; choose auth approach compatible with Workers |
| No testing framework in starter | TDD blocked until setup | Phase 1 prioritizes test tooling before feature code |
| Password hashing library compatibility with Workers | Runtime errors on hash/verify | Evaluate library in Workers runtime during Phase 1 spike |
| D1 cold starts or latency | Slow sign-in/sign-up | Acceptable for MVP; monitor and optimize if needed |

### User Experience Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Strict password rules frustrate users | Abandonment at sign up | Show requirements upfront; specific error messages per rule |
| No password reset in MVP | Locked-out users cannot recover | Document as known limitation; prioritize in next sprint |
| Redirect loop between auth and protected pages | Broken navigation | Integration tests for all redirect scenarios in Phase 5 |

### Open Questions

| ID | Question | Owner | Status |
|----|----------|-------|--------|
| OQ-1 | Which authentication library or pattern will be used (e.g. Auth.js, Lucia, custom sessions)? | Dev team | **Resolved** — Custom sessions with D1 + Web Crypto PBKDF2 password hashing |
| OQ-2 | Which database/bindings will store users (D1, KV, other)? | Dev team | **Resolved** — Cloudflare D1 with binding `DB` |
| OQ-3 | What is the default session expiry duration? | Dev team | **Open** |
| OQ-4 | Should the application root `/` redirect to Sign In or a marketing landing page? | Product | **Open** |
| OQ-5 | Should post-login redirect return users to their originally requested URL? | Product | **Open** — deferred unless needed in Phase 5 |
| OQ-6 | Which testing framework (Vitest, Jest, Playwright for E2E)? | Dev team | **Resolved** — Vitest with jsdom |
| OQ-7 | Should Full Name allow international characters and hyphens/apostrophes (e.g. "Mary-Jane O'Brien")? | Product | **Open** — recommend yes, with reasonable length limit |

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Sign Up completion rate | > 80% of started registrations | Analytics event: form start vs. success (future) |
| Sign In success rate | > 95% for valid credentials | Server logs / test suite |
| Auth test coverage | 100% of validation rules; all user stories tested | Test report |
| Auth page load time | < 2s sign-in/sign-up submission | Manual / performance test |
| Accessibility | Zero critical WCAG violations on auth pages | axe or Lighthouse audit in Phase 6 |
| Build health | lint and build pass on every phase completion | CI / local commands |

---

## Dependencies

### External Dependencies (To Be Added)

| Dependency | Purpose | Approval Required |
|------------|---------|-------------------|
| Testing framework (TBD) | TDD and regression tests | Yes |
| Database binding (likely D1) | User persistence | Yes |
| Password hashing library (TBD) | Secure password storage | Yes |
| Authentication/session library (TBD) | Session management | Yes |

### Internal Dependencies

| Dependency | Purpose |
|------------|---------|
| Next.js App Router | Pages, layouts, middleware |
| shadcn/ui | Form inputs, buttons, alerts |
| Tailwind CSS v4 | Responsive styling |
| Wrangler / Cloudflare bindings | Production runtime and secrets |
| `.dev.vars` | Local secrets (session signing key, etc.) |

### Environment Variables (Placeholder)

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` or equivalent | Session signing / encryption |
| Database binding | Configured in `wrangler.jsonc` (not a plain env var) |

Exact names will be documented in `.dev.vars.example` during Phase 1.

---

## Technical Implementation Details

> **Sprint 0 note:** This section is intentionally empty. It will be populated during implementation phases with decisions, patterns, and references — not during Sprint 0 design.

### Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| — | — | — |

### Troubleshooting Guide

> Added during implementation when issues are discovered and resolved.

---

## Notes for AI Agents

When working with this PRD:

1. **Read Scope first.** Do not implement quiz features or out-of-scope auth enhancements.
2. **Follow TDD.** Write failing tests before production code in every phase.
3. **Ask before adding dependencies.** Propose library choices with rationale; wait for approval.
4. **Update phase status** in Implementation Phases as work progresses (PLANNED → IN PROGRESS → COMPLETED).
5. **Mark acceptance criteria** when features are verified by passing tests, lint, and build.
6. **Populate Technical Implementation Details** with decisions made — do not pre-fill with speculative code.
7. **Do not edit generated files** (`package-lock.json`, `cloudflare-env.d.ts`).
8. **Verify on Workers runtime** with `npm run preview` for anything session- or cookie-related.
9. **Keep secrets out of the repo.** Use `.dev.vars` locally and Wrangler secrets in production.
10. **Update AGENTS.md** project description when authentication is complete.

---

## Current Status

**Last Updated:** August 28, 2026

**Sprint:** Sprint 1 — Authentication Implementation

**Status:** IN PROGRESS — Phase 1 complete

**Current Phase:** Phase 2 — Validation and Domain Logic

**Next Steps:**

1. Implement validation module with TDD (Phase 2).
2. Continue through Phases 3–6 for full auth flow.
