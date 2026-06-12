# Architectural & Design Decisions

This document outlines the core technical and product decisions made during the development of this Splitwise Clone MVP.

## 1. Sequence Numbers (Discord-Style Tags)
**Decision:** Users are assigned a sequential integer ID appended to their username (e.g., `Kakol#1`) rather than relying on email addresses for finding friends.
**Rationale:** In a real-world scenario, searching by email can be a privacy concern or tedious. A username+sequence number allows precise, unique identification without exposing sensitive contact information, functioning seamlessly as a lookup key for the Group Invitations system.

## 2. Greedy Algorithm for Debt Simplification
**Decision:** Implemented a backend algorithm using Python's `heapq` (Min-Max Heaps) to calculate the most efficient path to settle debts in a group.
**Rationale:** Splitwise's core feature is minimizing the number of transactions. Instead of a naïve approach (where everyone pays exactly who they owe directly, creating a spiderweb of dozens of small transactions), this algorithm mathematically groups the largest debtors with the largest creditors, ensuring the absolute minimum number of payments are required.

## 3. Strict Security Model (Refresh-Logout & Back-Arrow Prevention)
**Decision:** The frontend utilizes `performance.getEntriesByType("navigation")` to detect page reloads and instantly triggers a logout. It also manipulates `window.history.pushState` to intercept back-arrow navigation.
**Rationale:** This was chosen to build a highly secure, banking-level session model where a user cannot accidentally leave a secure session open on a public computer.

## 4. Single-Device Session Enforcement
**Decision:** When a user logs in, the backend iterates over the `django_session` table and deletes any previous sessions linked to their user ID.
**Rationale:** Prevents concurrent logins across multiple browsers or devices, ensuring state consistency and maximizing security.

## 5. HTML5 Canvas vs. CSS Backgrounds
**Decision:** Used an active `requestAnimationFrame` loop on an HTML5 `<canvas>` element for the 5 dynamic themes instead of static CSS images or videos.
**Rationale:** Canvas allows for interactive, programmatic micro-animations (like drifting stars, rain, or floating particles) that react dynamically without the heavy bandwidth cost of loading massive video files, providing a premium "Glassmorphism" UI experience.

## 6. AJAX Polling over WebSockets
**Decision:** Used `setInterval` for fetching group updates and invitations instead of integrating `django-channels` and Redis for WebSockets.
**Rationale:** Given the strict 3-day MVP scope, AJAX polling provided the necessary "real-time" feel for the Expense Chat and Invitation systems without introducing the massive infrastructure overhead and deployment complexity of WebSockets.
