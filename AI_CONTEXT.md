# AI_CONTEXT.md

## 1. Product Understanding
The goal is to build a simplified Splitwise clone in 3 days. It must support core functionalities: email-based authentication, group management, advanced expense sharing (Equal, Exact, Percentage, Share), group/individual balances, debt simplification, and a real-time expense chat. It must look highly premium with glassmorphism and animated backgrounds.

## 2. Product Scope (MVP)
* **In Scope**:
  * Secure Registration (Email token activation + Password Regex: min 8 chars, letters & numbers).
  * Unique Sequence Number Tagging (e.g., `Username#12`) for exact user identification.
  * Groups: Create, invite/add users via exact tag, remove users.
  * Expenses: Create expenses with robust split strategies (Equally, Unequally, Percentage, Shares).
  * Expense Chat: Real-time chat per expense.
  * Balances: Group-wise balances and individual net balance summaries.
  * Settlements: Record cash payments to settle debts.
  * Themes: HTML5 Canvas animated backgrounds (Standard Gradient, Nature with falling leaves, City with traffic).

## 3. Implementation Decisions
* **User Tagging:** Exposing the auto-incrementing Database ID as the Sequence Number (`User.id`) to fulfill the "first come first serve" primary key requirement.
* **Debt Simplification:** Implemented a greedy cash flow algorithm using Python's `heapq` module to minimize the number of payments required to settle group debts.
* **UI Alerts:** Completely replaced native browser `alert()` and `prompt()` with custom CSS Modals and animated Toasts.

## 4. Engineering Requirements
* Must use Relational Databases only.
* Must not store plain-text passwords (uses Argon2 / Django PBKDF2 default).
* UI must be responsive and modern without relying on heavyweight libraries like React.

## 5. Tech Stack
* **Frontend:** Vanilla JavaScript, HTML5 Canvas, CSS3 (CSS Variables, Flexbox, Glassmorphism).
* **Backend:** Python + Django (REST APIs + HTML templating).
* **Icons:** Boxicons.

## 6. Database Schema (Relational)
* **User**: Django's built-in `User` model.
* **Group**: `id`, `name`, `created_at`
* **GroupMember**: `group_id`, `user_id`, `joined_at`
* **Expense**: `id`, `group_id`, `description`, `total_amount`, `paid_by_id`, `created_at`
* **ExpenseSplit**: `expense_id`, `user_id`, `amount_owed`
* **Settlement** (Payment): `id`, `group_id`, `payer_id`, `payee_id`, `amount`, `created_at`
* **ExpenseMessage** (Chat): `id`, `expense_id`, `user_id`, `message`, `created_at`
* **UserBalance**: `group_id`, `user_id`, `net_balance` (Maintained via Django signals).

## 7. API Design
* `POST /api/register/` -> Returns `reset_link` locally for demo.
* `POST /api/set-password/`
* `POST /api/login/`, `POST /api/logout/`
* `GET /api/groups/`, `POST /api/groups/`
* `GET /api/groups/<id>/members/`, `POST /api/groups/<id>/members/` (Expects `Username#ID`), `DELETE`
* `GET /api/groups/<id>/expenses/`, `POST /api/groups/<id>/expenses/`
* `GET /api/expenses/<id>/chat/`, `POST /api/expenses/<id>/chat/`
* `GET /api/balances/`
* `POST /api/settlements/`

## 8. Frontend Structure
Single Page Application (SPA) utilizing a base template (`base.html`) for the canvas engine and a `dashboard.html` for the core app view. `app.js` handles all state, DOM manipulation, polling, and `fetch` calls to the REST APIs.

## 9. Deployment Plan
* Designed to be deployed on Render.
* Utilizes `dj_database_url` for easy transition to production PostgreSQL/MySQL.
* Uses standard `gunicorn` configuration.

## 10. Testing Plan
* Manual testing of all edge cases in UI (short passwords, invalid emails, empty expense inputs).
* Algorithmic testing of the `heapq` Debt Simplification python module.
* Database reset tests (using `manage.py flush`) to ensure schema integrity from a zero-state.

## 11. Trade-offs
* Polling is used for the chat system to save 2 days of backend WebSocket engineering, trading slight network overhead for extreme architectural simplicity.
* `ConsoleBackend` is used for emails to allow rapid local testing without requiring developers to register SMTP API keys.

## 12. Prompts and AI Responses
* **Prompt:** "email will be requried for registration and a confirmation email so will be send back in which they will get the link to make a password... beautiful: nature oriented in which there is multiple trees... or a busy top Road view"
* **Response:** Implemented `ConsoleBackend` to print the secure activation link, enforced regex password policies on the Set Password screen, and built a custom HTML5 canvas rendering engine for the Nature and City themes.
* **Prompt:** "Also give a Sequence number which is not visible until an account is made... it will work as a primary key"
* **Response:** Exposed the Django auto-incrementing User ID to the frontend (e.g. `Kakol#1`), heavily modifying the `group_members` POST endpoint to parse the string and strictly query both the username and the ID before adding to a group.

## 13. Changes Made During Implementation
* Migrated from a simple username/password login to a multi-step email token activation flow.
* Upgraded the `<select>` theme dropdown to a custom CSS modern select to remove "Old Computer" aesthetic.
* Completely rewrote the initial static standard background into an animated, breathing radial gradient with floating orbs.
* Implemented abandoned signup cleanup logic in the registration endpoint to prevent usernames from being locked if a user fails to set their password.

## 14. Known Limitations
* Real-time notifications for expense creation do not exist natively unless the user refreshes or relies on the balance polling.
* Multi-currency calculations are not supported; everything assumes a single base currency.
