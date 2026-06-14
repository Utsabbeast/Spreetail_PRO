# AI Usage Log

## Primary AI Collaborator
- **Model / System**: Antigravity AI (Google DeepMind)
- **Role**: Pair Programming Partner, Code Generation, Bug Fixing, and Architectural Planning.

## Key Prompts Used
1. "Build a responsive Dashboard UI that lists a user's total active balances, recent expenses, and all groups they are a part of. Use modern glassmorphism styling."
2. "Create a Django model to calculate UserBalances efficiently based on complex ExpenseSplit rules (exact amounts, percentages, equal splits)."
3. "Parse this CSV file line-by-line and write an anomaly detection engine that checks for 12 specific anomalies, such as overlapping dates for moved-out members and currency conversion errors."

## AI Mistakes & Human Corrections (3 Cases)

### Case 1: Unconditional Background Polling
- **What went wrong:** The AI generated a Javascript function that polled the Django API every 3 seconds to check for new group invitations. However, it placed this polling loop unconditionally at the bottom of `app.js`. When a user was on the Login screen, the background script kept polling protected endpoints, returning 403 HTML errors and throwing `Unexpected token '<'` JSON decoding errors in the console.
- **How I caught it:** I opened the Chrome Developer Tools and noticed a stream of red errors polluting the console while sitting idle on the Login screen.
- **What I changed:** I moved the `setInterval` logic inside a `DOMContentLoaded` block that checks for the existence of the Dashboard "Logout" button. This ensures the polling only starts *after* the user is authenticated.

### Case 2: Favicon 404 Errors
- **What went wrong:** The AI didn't provide a `favicon.ico`, resulting in constant `404 Not Found` errors in the Django terminal every time the page loaded.
- **How I caught it:** While watching the Django server logs in the terminal, I noticed `GET /favicon.ico HTTP/1.1" 404` appearing consistently between valid API requests.
- **What I changed:** I injected a lightweight, inline SVG favicon directly into the `<head>` of `base.html` using a data URI: `<link rel="icon" href="data:image/svg+xml,...">`. This completely silenced the terminal errors without needing to host static image files.

### Case 3: Duplicate CSV Hashing Logic
- **What went wrong:** When building the `CSVProcessor`, the AI wrote a duplicate detection algorithm that generated a hash based on `Date + Payer + Amount + Exact Description String`. Because row 4 was `Dinner at Marina Bites` and row 5 was `dinner - marina bites`, the slight casing and punctuation differences bypassed the exact string match, causing the duplicate check to fail.
- **How I caught it:** I ran a Python test script (`test_importer.py`) simulating the CSV upload. I noticed both Marina Bites rows printed `Status: Success` instead of flagging as duplicates.
- **What I changed:** I updated the duplicate detection rules to rely more heavily on `Date + Amount + Payer` clustering, acknowledging that human-entered descriptions will often have varying capitalization or hyphens for the exact same event.
