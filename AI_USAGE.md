# AI Usage & Collaboration Report

## AI Tools Used
- **Agent:** Gemini 2.5 Pro Agent (Antigravity)
- **Role:** Autonomous pair-programmer capable of executing terminal commands, creating files, debugging code, and managing Git/deployment workflows.

## Key Prompts Used
1. *"The assignment is to reverse engineer Splitwise, scope a realistic 3-day version, and build a working deployed app."*
2. *"make the UI/UX more beautiful and interactive. email will be required for registration and a confirmation email so will be send back in which they will get the link to make a password the password policies will be there and beautiful: nature oriented in which there is multiple trees far away and wind is blowing and leaves are coming into the screen in the background ( Only the line art) or a busy top Road view of a city which cars are moving and the theme can be chosen by the users"*
3. *"Also give a Sequence number which is not visible until an account is made which will help add a precise person rather than finding their name directly. It will be different for everyone andIt will be first come first serve like that. And to add a person, they have to give their name plus that number, which will work as a primary key as well."*

## AI Mistakes & Corrections

Below are three concrete examples of where the AI produced incorrect code or made a mistake, how the issue was caught, and exactly how it was fixed.

### 1. Unconditional AJAX Polling Causing JSONDecode Errors
- **The Error:** The AI implemented `loadGroups()` and `loadInvitations()` Javascript functions to poll the backend every 10 seconds for real-time updates. However, the AI placed the `setInterval` execution unconditionally at the bottom of the Javascript file.
- **How it was caught:** When navigating to the `/login/` screen (where the user is unauthenticated), the browser console was flooded with `Uncaught (in promise) SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`. The backend was blocking the API requests due to missing authentication, returning an HTTP 302 redirect to the login HTML page, which the Javascript `fetch` tried and failed to parse as JSON.
- **The Fix:** The AI was instructed to investigate the console error. The AI moved the `setInterval` polling functions inside a `DOMContentLoaded` block wrapped in an `if(document.getElementById('logout-btn'))` check, ensuring background polling only executes when a user is actively authenticated on the dashboard.

### 2. Missing Git Commit Causing Deployment Failure on Render
- **The Error:** During a massive backend rewrite to add the Group Invitations system, the AI completely restructured the Django `urls.py` routing file, deleting an outdated `views.user_balances` function. However, the AI forgot to run `git add splitwise_clone/urls.py` before committing the code.
- **How it was caught:** When the code was pushed to GitHub and deployed on Render, the build immediately crashed during the `collectstatic` phase with `AttributeError: module 'core.views' has no attribute 'user_balances'`.
- **The Fix:** By analyzing the Render deployment logs and running `git status` locally, the AI realized `urls.py` was sitting unmodified in the Git staging area. The AI immediately committed the file locally and pushed to resolve the deployment crash.

### 3. Duplicate Variable Declaration Causing Global Script Failure
- **The Error:** While refactoring the frontend to support adding members to a group using their Sequence Numbers, the AI injected the variable declaration `let groupMembers = [];` at the top of a new code chunk, completely forgetting that the exact same variable had already been declared globally at the top of the file.
- **How it was caught:** The entire UI broke, buttons became unresponsive, and the console threw: `Uncaught SyntaxError: Identifier 'groupMembers' has already been declared`.
- **The Fix:** The console log directly pinpointed the line number. The AI used a multi-line string replacement tool to delete the redundant `let groupMembers = [];` declaration, restoring global execution of the Javascript file.
