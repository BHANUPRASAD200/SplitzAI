# ⚡ SplitzAI: Next-Gen Shared Expense Engine & FinTech Workspace

![SplitzAI Dashboard](SplitzAI.png)

> **Pure Vanilla JS. Zero Frameworks. Intense FinTech Design. Maximum Performance.**

[🚀 Live Demo: SplitzAI on Vercel](https://splitzai.vercel.app/)

SplitzAI is a hyper-polished, AI-powered shared expense tracker, debt simplifier, and multi-currency settlement engine. Designed with an **intense modern FinTech aesthetic** (Obsidian dark mode, mesh glowing HUDs, micro-interactions, and glassmorphism), it transforms group financial management into an effortless, intelligent experience.

---

## 🌟 What's New in SplitzAI v2.0 PRO

### 1. 🎛️ Futuristic Finance HUD (Heads-Up Display)
- **Ambient Mesh Glow & Real-Time Stats**: Displays total workspace expenditure, per-person average breakdowns, active unsettled debt, settled totals, and top spending categories.
- **Dynamic LED Indicators**: Real-time status indicators and active ledger signals.

### 2. 📷 AI Receipt OCR Vision Scanner
- **Bill & Receipt Scanning**: Upload any receipt image or test with pre-configured instant sample bills (Bistro Dinner, Airport Cab, Luxury Resort).
- **Animated Laser Scanning Beam**: High-tech visual laser scan simulation with item, date, and amount extraction.
- **One-Click Form Autofill**: Extracts merchant title, total bill, category, and date directly into the Add Expense modal.

### 3. 🤖 Enhanced Natural Language (NLP) Engine
- **Conversational Bill Entry**: Enter transactions in plain English:
  - *"Alice paid ₹1500 for dinner split with Bob and Charlie"*
  - *"Bob paid $45 for Uber taxi"*
  - *"Charlie paid 3000 for Airbnb stay"*
- **Smart Entity Extraction**: Automatically extracts payer, exact amount, currency symbol, participants, and categorizes the expense into Food, Travel, Stay, Fun, Shopping, or Other.
- **Quick Prompt Chips**: Clickable suggestion chips for fast instant entry.

### 4. 💱 Multi-Currency Settlement Engine
- **Global Currency Switcher**: Switch the entire workspace between **₹ INR**, **$ USD**, **€ EUR**, **£ GBP**, **د.إ AED**, and **¥ JPY**.
- **Real-Time Currency Conversion**: Seamlessly converts multi-currency expenses into the active group base currency.

### 5. 📱 Instant UPI & QR Code Settlement Engine
- **Direct QR Generation**: Generates an offline high-contrast SVG QR Code when settling any balance.
- **One-Click Copy UPI ID**: Compatible with GPay, PhonePe, Paytm, or any standard banking application.
- **Celebration Engine**: Fires a 60fps HTML5 Canvas confetti explosion when debts are settled!

### 6. 📊 Visual Spending Breakdown & Analytics
- **Category Progress Meters**: Animated multi-color progress bars showing percentage and totals across categories.
- **Member Contribution Share**: Visualizes who has funded what proportion of the group's total spending.
- **AI Financial Intelligence Advice**: Highlights the highest spending member, dominant category, and cost efficiency.

### 7. 🔍 Instant Search & Category Filter System
- **Real-Time Fuzzy Search**: Filter expenses instantly by title, payer, or category tag.
- **Category Filter Pills**: Quick filter tabs for All, Food, Travel, Stay, Fun, Shopping, and Settled payments.

### 8. 📤 Export, Backup & Share Hub
- **WhatsApp / Telegram Summary**: Generate cleanly formatted text reports with emojis ready to be shared with group members.
- **CSV Ledger Export**: Export Excel-ready `.csv` spreadsheets.
- **JSON Backup & Restore**: Download complete ecosystem backups or restore workspaces across devices.

### 9. 🎨 Intense Modern FinTech UI/UX
- **Deep Obsidian & Glassmorphism Design**: High-contrast dark mode with glowing teal, emerald, and AI fuchsia highlights, plus a clean light mode toggle.
- **Mobile Drawer Navigation**: Fully responsive on screens from 320px mobile phones to 4K desktop command centers.
- **Custom Toast & Dialog System**: Replaces intrusive browser alerts with non-blocking glass toasts and custom confirmation modals.

---

## 🚀 Instant Setup Instructions

Zero build steps, zero node dependencies, zero configuration:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/BHANUPRASAD200/SplitzAI.git
   ```
2. **Launch in Browser**:
   - Double-click `index.html` to open it in any browser (Chrome, Edge, Safari, Firefox).
   - Alternatively, serve locally using Python:
     ```bash
     python -m http.server 3000
     ```

---

## 📐 Algorithmic Architecture

### Greedy Debt Simplification
SplitzAI solves the N-party debt minimization problem:
1. **Net Balance Vector**:
   $$\text{Balance}_i = \sum \text{Paid}_i - \sum \text{Owed}_i$$
2. **Bipartite Partitioning**: Divides users into sorted vectors:
   - $\text{Debtors} = \{u \mid \text{Balance}_u < 0\}$ (ascending)
   - $\text{Creditors} = \{v \mid \text{Balance}_v > 0\}$ (descending)
3. **Greedy Matching**: Iteratively settles $\min(|\text{Debtor}|, \text{Creditor}|)$, reducing transaction edges from $O(N^2)$ to at most $O(N - 1)$.

---

## 🛠️ Tech Stack
- **Core**: Vanilla ECMAScript (ES6+), HTML5 Semantic Architecture, CSS3 Custom Properties.
- **Typography**: Plus Jakarta Sans, Outfit, JetBrains Mono.
- **Icons**: FontAwesome 6.4+.
- **Avatars**: DiceBear Notionists API.
- **Graphics**: HTML5 Canvas Particle Engine, Pure SVG QR Vector Generator.

---

## 🌍 Deployment
- **Vercel**: [splitzai.vercel.app](https://splitzai.vercel.app/)
- **GitHub Pages**: Supported out of the box with zero build steps.
