# AI Context: Splitwise Clone MVP

This document contains the exact context, schema, and architectural decisions used to generate the Splitwise Clone MVP. Another developer or AI agent should be able to reconstruct the exact same application using the specifications below.

## Product Understanding
A highly secure, simplified version of Splitwise for managing shared expenses within groups. Key differentiators include a strict "Sequence Number" Discord-style tagging system for member identification, a greedy `heapq`-based cash flow algorithm for debt simplification, an ultra-strict session security model (single-device, refresh-logout), and a highly interactive "Glassmorphism" UI layered over a dynamic HTML5 Canvas rendering engine.

## Product Scope
- **Auth:** Email/Console-token based registration, regex password enforcement (8 chars, alphanumeric), single-device limit, browser-refresh logout, browser-back-arrow prevention (`popstate` manipulation).
- **Groups:** Users create groups and invite others via a dedicated Invitation system (Accept/Deny workflow).
- **Members:** Unique identification via `Username#ID` (e.g., Kakol#1).
- **Expenses:** Added to groups, triggering relational balance updates. Four split strategies: Equal, Exact, Percentage, Shares.
- **Settlement:** Simplified cash flow algorithm to calculate minimal transactions between users.
- **Real-Time UI:** AJAX polling for expenses and invitations.
- **Theming:** HTML5 Canvas Engine providing 5 dynamic themes (Standard, Nature, City, Space, Ocean).

## Engineering Requirements & Tech Stack
- **Backend:** Django 6.0.6 (Python 3.10+)
- **Database:** SQLite3
- **Frontend:** Vanilla JS (`app.js`, `bg_animation.js`), Vanilla CSS (`style.css`), HTML5 Templates.
- **Iconography:** Boxicons
- **Session Engine:** Django `contrib.sessions`, modified to enforce single-device policy.

## Database Schema (Django Models)

1. **User (auth.User):** Standard Django model. ID acts as the "Sequence Number".
2. **Group:** 
   - `id` (PK)
   - `name` (CharField, max_length=100)
   - `created_at` (DateTimeField)
3. **GroupMember:**
   - `group` (ForeignKey -> Group)
   - `user` (ForeignKey -> User)
   - `joined_at` (DateTimeField)
4. **Expense:**
   - `group` (ForeignKey -> Group)
   - `description` (CharField, max_length=255)
   - `amount` (DecimalField, max_digits=10, decimal_places=2)
   - `paid_by` (ForeignKey -> User)
   - `created_at` (DateTimeField)
5. **ExpenseSplit:**
   - `expense` (ForeignKey -> Expense)
   - `user` (ForeignKey -> User)
   - `amount_owed` (DecimalField, max_digits=10, decimal_places=2)
6. **Settlement:**
   - `group` (ForeignKey -> Group)
   - `payer` (ForeignKey -> User)
   - `payee` (ForeignKey -> User)
   - `amount` (DecimalField)
   - `created_at` (DateTimeField)
7. **ExpenseMessage:** (For Expense-level chat)
   - `expense` (ForeignKey -> Expense)
   - `user` (ForeignKey -> User)
   - `message` (TextField)
   - `created_at` (DateTimeField)
8. **UserBalance:** (Automatically managed via Django Signals)
   - `user` (ForeignKey -> User)
   - `group` (ForeignKey -> Group)
   - `balance` (DecimalField)
9. **GroupInvitation:**
   - `group` (ForeignKey -> Group)
   - `invited_user` (ForeignKey -> User)
   - `inviter` (ForeignKey -> User)
   - `status` (CharField: pending/accepted/declined)

## API Design (JSON endpoints)

- `POST /api/register/`: Accepts `username`, `email`. Creates inactive user. Sends console email with uid/token.
- `POST /api/set-password/`: Accepts `uidb64`, `token`, `password`. Activates user.
- `POST /api/login/`: Validates credentials. Iterates over `django_session` table and deletes previous sessions for `user.id`.
- `POST /api/logout/`: Standard `logout(request)`.
- `GET/POST /api/groups/`: Fetch groups or create a new group.
- `GET/POST /api/groups/<id>/members/`: Fetch members or POST to invite a member using `username` and `sequence_number`.
- `GET/POST /api/groups/<id>/expenses/`: Fetch expenses or POST a new expense. Expects `splits` array.
- `GET /api/groups/<id>/balances/`: Returns each member's current balance and the minimal settlement transactions calculated by the Debt Simplification algorithm.
- `POST /api/groups/<id>/settle/`: Records a settlement payment.
- `GET/POST /api/invitations/`: Polled by UI. Returns pending `GroupInvitation`s.
- `POST /api/invitations/<id>/<action>/`: Action is `accept` or `deny`.

## Architecture & Algorithms

### Debt Simplification Algorithm
The system simplifies debts across a group using a Greedy algorithm (`heapq`):
1. Calculates net balance for every user.
2. Separates into `debtors` (negative balance) and `creditors` (positive balance) using min/max heaps.
3. Continuously matches the largest debtor with the largest creditor to minimize total transactions.

### Security Architecture
- **Single Device Policy:** Enforced in `/api/login/` by querying `Session.objects.filter` and deleting keys matching the `_auth_user_id`.
- **Browser History Trap:** `app.js` runs `window.history.pushState(null, null, window.location.href);` globally and intercepts `popstate` to prevent Back/Forward arrow navigation.
- **Refresh Logout:** `app.js` reads `performance.getEntriesByType("navigation")[0].type`. If `"reload"`, it fires `fetch('/api/logout/')` and redirects to `/login/`.

### Frontend Structure
- **Vanilla SPA:** `dashboard.html` holds all modals (Add Expense, Settle, Manage Members). Modals use `.glass-panel` CSS for blurred glassmorphism.
- **Canvas Engine:** `bg_animation.js` attaches to a fixed `canvas` element at `z-index: -1`. Runs a `requestAnimationFrame` loop. Themes (Standard, Nature, City, Space, Ocean) dynamically swap rendering logic on the fly.

## Deployment Plan
1. Ensure SQLite database is secure or migrate to PostgreSQL.
2. Change `EMAIL_BACKEND` to SMTP (SendGrid/Mailgun) for production.
3. Collect static files (`python manage.py collectstatic`).
4. Deploy via Render/Heroku using Waitress or Gunicorn as the WSGI server.

## Trade-offs & Known Limitations
- Relying on Javascript's `performance.navigation` for refresh-logout is effective but strict; users cannot use standard browser refresh mechanics without losing their session.
- Django's default `django_session` table requires full iteration to clear sessions by user. In a massive scale app, a custom Session backend or token architecture (JWT) would be preferred over iterating rows.
- SQLite is used for MVP simplicity.

## Prompts and AI Responses
*(See `KEY_PROMPTS.md` for the exact prompt instructions injected into the AI).*
