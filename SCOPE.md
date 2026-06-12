# Project Scope: Splitwise Clone MVP

This document outlines the features and functionalities that were specifically included (In Scope) and intentionally excluded (Out of Scope) during the 3-day development of this Minimum Viable Product (MVP).

## 🟢 In Scope (Implemented Features)

### 1. Authentication & Security
*   **User Registration:** Email and password registration with regex-enforced password policies.
*   **Email Verification Simulation:** Activation links sent to the server console to simulate email delivery for setting passwords.
*   **Strict Session Management:** Concurrent logins are blocked (single-device policy).
*   **Browser Security:** Forward/Back arrow prevention (`popstate` manipulation) and global refresh-logout enforcement.

### 2. Group & Member Management
*   **Groups:** Users can create isolated groups for specific events or trips.
*   **Unique Identifiers:** Discord-style Sequence Numbers (e.g., `Username#123`) to precisely identify users and prevent naming collisions.
*   **Invitation System:** Users can invite others using their Sequence Number. Invitations must be actively Accepted or Denied via an interactive dashboard widget.

### 3. Expenses & Mathematics
*   **Expense Creation:** Users can add expenses to a group, providing a description, total amount, and the user who paid.
*   **Split Strategies:** Four distinct splitting mechanisms:
    1.  **Equally:** Divide the total evenly among selected members.
    2.  **Exact Amounts:** Specify the exact dollar amount each person owes.
    3.  **Percentages:** Specify the percentage of the total each person owes (must equal 100%).
    4.  **Shares:** Distribute the cost based on proportional weight/shares.
*   **Debt Simplification:** A Python `heapq` greedy algorithm that runs on the backend to calculate the absolute minimum number of transactions required for everyone in the group to settle their debts.
*   **Settlement:** A dedicated UI flow to record cash/external payments between a debtor and a creditor, neutralizing their balances.

### 4. Interactive UI & Theming
*   **Architecture:** Vanilla JavaScript Single Page Application (SPA) feel using AJAX polling.
*   **Expense Chat:** An isolated, real-time polling chat system attached to individual expenses.
*   **Theming Engine:** A dynamic HTML5 Canvas background system that supports 5 real-time rendered themes (Standard Gradient, Nature, City, Space, Ocean).
*   **Design Language:** Glassmorphism UI (frosted glass, blurs) using pure Vanilla CSS.

---

## 🔴 Out of Scope (Intentionally Excluded)

The following features were deemed non-essential for the core MVP and are deferred to future iterations:

*   **Real SMTP Email Delivery:** The system currently prints activation emails to the terminal/console to avoid requiring third-party API keys (e.g., SendGrid) during initial setup.
*   **Social OAuth Login:** Google, Facebook, or Apple sign-in flows.
*   **WebSockets:** Real-time updates (like chat and invitations) use periodic AJAX polling (`setInterval`) rather than persistent WebSocket connections (`django-channels`) to reduce infrastructure complexity.
*   **Multi-Currency Support:** All transactions are assumed to be in a single baseline currency. Real-time conversion and FX rates are excluded.
*   **File Uploads:** Uploading receipt images or user profile pictures.
*   **Dedicated Mobile App:** The UI is responsive web-based, but no native iOS/Android codebase was generated.
*   **PostgreSQL:** The app uses SQLite for zero-configuration local development and deployment.
