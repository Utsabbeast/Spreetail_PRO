# Splitwise Clone MVP

A premium, simplified clone of Splitwise built with Django and Vanilla JavaScript, featuring a dynamic HTML5 canvas background system and a completely custom glassmorphism UI.

## Features Built
1. **Authentication:** Email-based registration with console token delivery, regex password enforcement, and secure login.
2. **Groups & Members:** Create groups, add members using precise Discord-style Sequence Number tags (e.g. `Kakol#1`).
3. **Expenses & Splitting:** Add expenses and split them 4 ways: Equally, Exact Amounts, Percentages, and Shares.
4. **Data Import & Anomaly Detection:** Upload a `.csv` file to instantly map columns to the database schema. The backend analyzes the spreadsheet line-by-line, handling 12 distinct anomalies (missing data, negative amounts, percentage mismatches) and generates a real-time, interactive UI report.
5. **Expense Chat:** Real-time polling chat system isolated to individual expenses.
6. **Debt Simplification:** Uses a greedy Cash Flow algorithm via Python `heapq` to minimize the number of transactions needed to settle up group debts.
7. **Themes:** Features an interactive Dashboard with 5 dynamic HTML5 canvas background themes (Standard Gradient, Nature, City, Space, Ocean).
8. **Strict Security Model:** Implements global refresh-logout, Back-Arrow browser prevention via `popstate` manipulation, and single-device concurrent session enforcement.

## Local Setup Instructions

### 1. Prerequisites
- Python 3.10+
- pip (Python package installer)
- Git
- PostgreSQL (Optional, but required for production on Render)

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
4. Log in, create a group, and click **Import CSV** to witness the Anomaly Detector in action! All amounts are handled in `INR (₹)`.

## Production Deployment (Render)
This application is completely configured for deployment on Render's Free Tier:
1. Create a free **PostgreSQL** database on Render and copy its Internal URL.
2. Create a **Web Service** connected to your GitHub repo.
3. Set the `DATABASE_URL` environment variable to your Postgres URL.
4. Render's `build.sh` script automatically runs `collectstatic` and `migrate`.

## Deliverables Links
* **Public deployed app URL:** https://spreetail-clone.onrender.com
* **GitHub repository:** https://github.com/Utsabbeast/Spreetail_PRO

## AI Collaboration & Prompts
This project was entirely built through collaborative pair programming with the Gemini 2.5 Pro Agent (Antigravity).

### Key Prompts Used:
> "The assignment is to reverse engineer Splitwise, scope a realistic 3-day version, and build a working deployed app."

> "Make the UI/UX more beautiful and interactive. Email will be required for registration... nature oriented in which there is multiple trees far away and wind is blowing and leaves are coming into the screen in the background."

> "Also give a Sequence number which is not visible until an account is made which will help add a precise person rather than finding their name directly."

> "Build a responsive Dashboard page using standard vanilla CSS (no tailwind). Add the 'Import CSV' button to trigger the anomaly detector."
