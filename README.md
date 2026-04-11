# Smart Expense Splitter

An intuitive, simple web application for managing shared expenses, built as part of the Neev AI Internship Assignment.

## Features

- **Group Management:** Create a group and flexibly manage members.
- **Smart Expense Tracking:** Easily add expenses, specify who paid, and select who to split it with.
- **Debt Simplification:** The app uses an intelligent algorithm to automatically calculate "Who Owes Whom" in the most simplified manner (minimizing total transactions).
- **AI-Powered Insights:**
  - **Auto-Categorization:** Uses a Local NLP matcher to automatically categorize expenses (Food, Transportation, Accommodation, etc.) based on the description text.
  - **Spending Analytics:** Dynamically generates summaries regarding categorical spending and pinpoints the most prominent spenders.
- **Responsive UI:** A stunning, fully responsive layout built with glassmorphism, native dark-mode, and modern aesthetics. Locally persists state via `localStorage`.

## Setup Instructions

Since this is built with entirely native, framework-less web technologies (Vanilla HTML, CSS, JavaScript) for maximum performance and minimum footprint:

1. Clone or download the repository.
2. Simply open `index.html` in any web browser.
3. *No Node.js, `npm install`, or complex build steps are required!*

*(Note: Data is saved to your browser's local storage automatically so you don't lose data upon refresh).*

## Architecture Details

- **`index.html`**: The UI skeleton. Uses semantic tags to layout the Dashboard Grid, Header, and Sidebar. Incorporates FontAwesome for iconography and Google Fonts.
- **`style.css`**: Controls all visuals. Utilizes CSS variables for quick theme adjustment and relies heavily on Flexbox and CSS Grid for layout management.
- **`app.js`**: Contains the state management array, EventListeners, Mock AI/Analytics Logic, and the Debt Simplifier Engine.

### Core Algorithm (Debt Simplifier Engine)

The debt simplification works by:
1. Turning all transactions into a net balances array for each user.
2. Grouping users into Debtors (negative balance) and Creditors (positive balance).
3. Using a greedy algorithm that pairs the largest debtor with the largest creditor iteratively to clear balances with the minimal amount of edges (settlement transactions).

## Deployment

Deploying is extremely easy since this is a static site:
1. **Vercel / Netlify**: Simply link your Github Repository and select "Vanilla JS" or explicitly define the build command as empty and publish directory as the root folder.
