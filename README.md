# Splitwise Clone MVP

A premium, simplified clone of Splitwise built with Django and Vanilla JavaScript, featuring a dynamic HTML5 canvas background system and a completely custom glassmorphism UI.

## Features Built
1. **Authentication:** Email-based registration with console token delivery, regex password enforcement, and secure login.
2. **Groups & Members:** Create groups, add members using precise Discord-style Sequence Number tags (e.g. `Kakol#1`).
3. **Expenses & Splitting:** Add expenses and split them 4 ways: Equally, Exact Amounts, Percentages, and Shares.
4. **Expense Chat:** Real-time polling chat system isolated to individual expenses.
5. **Debt Simplification:** Uses a greedy Cash Flow algorithm via Python `heapq` to minimize the number of transactions needed to settle up group debts.
6. **Themes:** Features an interactive Dashboard with 3 dynamic HTML5 canvas background themes (Standard Gradient, Nature with falling leaves, City with moving traffic).

## Local Setup Instructions

### 1. Prerequisites
- Python 3.10+
- pip (Python package installer)
- Git

### 2. Installation
```bash
# Clone the repository
git clone <your-github-repo-url>
cd plac

# Create and activate a virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Start the local development server
python manage.py runserver
```

### 3. Usage
1. Open your browser and navigate to `http://127.0.0.1:8000`.
2. Click **Register** to create an account.
3. Check your terminal/command prompt for the Activation Link email. Copy and paste the link into your browser to set your password and activate your account.
4. Log in and start creating groups!

## Deliverables Links
* **Public deployed app URL:** `[Placeholder - Render URL here]`
* **GitHub repository:** `[Placeholder - GitHub URL here]`

## AI Collaboration & Prompts
This project was entirely built through collaborative pair programming with the Gemini 2.5 Pro Agent (Antigravity).

### Key Prompts Used:
> "The assignment is to reverse engineer Splitwise, scope a realistic 3-day version, and build a working deployed app."

> "make the UI/UX more beutiful and intrative. email will be requried for registration and a confirmation email so will be send back in which they will get the link to make a password the password policies will be there and beautiful: nature oriented in which there is multiple trees far away and wind is blowing and leaves are coming into the screen in the background ( Only the line art) or a busy top Road view of a city which cars are moving and the theme can be chosen by the users"

> "Also give a Sequence number which is not visible until an account is made which will help add a precise person rather than finding their name directly. It will be different for everyone andIt will be first come first serve like that. And to add a person, they have to give their name plus that number, which will work as a primary key as well."
