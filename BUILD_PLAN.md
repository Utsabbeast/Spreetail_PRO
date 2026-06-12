# BUILD_PLAN.md

## 1. Product Research
- **How I studied Splitwise:** Analyzed the core user journey of splitting bills (rent, dinners, trips) and managing shared group expenses. Reviewed the mechanism of exact splits vs percentages vs shares. 
- **What I learned:** The core value proposition isn't just math, but "Debt Simplification" (minimizing transactions). Transparency via a per-expense chat log is also critical to prevent disputes.
- **Identified Workflows:**
  - Secure Authentication & Onboarding.
  - Group Creation & precise Member additions (to prevent name collisions).
  - Expense Creation with multiple split strategies.
  - Expense communication (chat).
  - Viewing Individual & Group balances.
  - Settling up debts via recorded cash payments.
- **Product Assumptions:** Users prefer simple cash settlements over integrated payment gateways (Stripe/PayPal) for an MVP. Users want precise control over whom they add, necessitating a Sequence Number tagging system (e.g., `User#123`).

## 2. Architecture
- **Tech Stack:** Django (Python) Backend, Vanilla JavaScript/HTML5/CSS3 Frontend. No heavyweight JS frameworks to ensure rapid 3-day MVP delivery while maintaining high performance.
- **Database Schema:** 
  - Core Models: `User`, `Group`, `GroupMember`, `Expense`, `ExpenseSplit`, `Settlement`, `ExpenseMessage`, and `UserBalance`.
  - SQLite for local development, easily swappable to MySQL for production via `dj_database_url`.
- **API Design:** RESTful API endpoints for all CRUD operations, leveraging JSON payloads and Django session authentication.
- **Frontend Structure:** Single Page Application (SPA) feel achieved through Vanilla JS `fetch` calls, manipulating the DOM via custom Modals and Toasts (completely replacing native browser alerts).
- **Deployment Approach:** Configured to be easily deployable on platforms like Render using standard Django deployment practices.

## 3. AI Collaboration Process
- **How I instructed the AI:** Provided a rigid persona prompt requiring the AI to act as a junior engineer, refusing to jump into code without first asking detailed architectural and product scoping questions.
- **What questions the AI asked:** The AI queried the scope of authentication (OAuth vs Email), database choice (SQL vs NoSQL), complex algorithm needs (Debt Simplification), and UI/UX aesthetic preferences.
- **How I answered:** Provided specific, premium UI requirements (Glassmorphism, animated Canvas themes: Nature/City), mandated a secure email token registration flow, requested a Sequence Number identification system, and confirmed Django + MySQL.
- **How the plan evolved:** Initially scoped as a standard Splitwise clone, but evolved into a highly customized, visually striking web app with Discord-style user tagging and real-time HTML5 canvas rendering based on direct feedback during the implementation phase.
- **How AI_CONTEXT.md was maintained:** The AI updated the context document after every major architectural decision, feature addition, or UX overhaul to ensure it remained the absolute source of truth.

## 4. Tradeoffs
- **What I simplified:** Used frontend JavaScript polling for the expense chat instead of building a complex WebSocket infrastructure (Django Channels + Redis).
- **What I hardcoded:** Email token delivery uses Django's `ConsoleBackend` for local development demonstration rather than integrating a real SMTP service like SendGrid.
- **What I avoided:** Currency conversion, receipt OCR scanning, and PDF exports were avoided to keep the 3-day MVP scope realistic.
- **What I would improve with more time:**
  1. Integrate real WebSockets for instant chat and live balance updates across multiple active sessions without HTTP overhead.
  2. Implement actual SMTP email delivery (SendGrid/Mailgun) for production activation links.
  3. Add Push Notifications (via Firebase/PWA) for mobile users when they are added to an expense.
  4. Build a dedicated React Native or Flutter mobile app consuming the same Django REST API.
