# EventEase AI: Your Event. Your Budget. Your AI Planning Team.

**EventEase AI** is a production-quality, generative AI multi-agent event planning platform built for weddings, community festivals, corporate gatherings, and milestone celebrations.

---

## 🚀 Key Highlights & Architecture

- **Multi-Agent Orchestration:** 6 coordinated Python agents (`orchestrator`, `budget`, `venue`, `theme`, `catering`, `timeline`, `risk`) interacting with structured JSON schemas and Google Gemini API.
- **Deterministic Budget Calculations:** 100% budget integrity with an auto-calculated 10% contingency reserve, per-guest metrics, and expense tracking in Python rather than relying on LLM arithmetic.
- **Interactive What-If Simulation Engine:** Recalculates category shifts (e.g. ₹10 Lakh to ₹8 Lakh budget cut, +100 guest surge, or outdoor rain contingency) with trade-off analysis before applying changes with user consent.
- **Indian Cultural Nuances:** Native support for Gujarati, Hindi, and English; authentic menus (Mohanthal, Undhiyu, separate Jain preparation counters), Mandap concepts, Toran entrances, and WhatsApp invitation generation.
- **Dual-Mode Resilient Database:** Connects to MongoDB Atlas / Local MongoDB, with automatic fallback to embedded persistent JSON storage so the app works out-of-the-box in any environment.

---

## 🛠 Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Recharts, Lucide Icons, React Router v6.
- **Backend:** Python, FastAPI, Pydantic v2, Python-Jose (JWT), Passlib (Bcrypt), Motor / PyMongo.
- **AI Integration:** Google Gemini API (`gemini-1.5-flash`), structured JSON outputs.

---

## 📦 Quickstart Guide

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
The FastAPI backend will start at `http://localhost:8000`. Swagger API documentation is available at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
The React frontend will be accessible at `http://localhost:5173`.

---

## 🧪 Hackathon Demo Walkthrough (Ahmedabad Gujarati Wedding)

1. **Step 1:** Register or sign in (Test login: `organizer@eventease.ai` / `password123`).
2. **Step 2:** Open **Create Event** wizard. Enter natural language:
   > *"I want to organize a traditional Gujarati wedding in Ahmedabad for 300 guests. My budget is ₹10 lakh. The celebration will last two days. I want traditional food with Jain options, beautiful decorations, and a memorable experience without overspending."*
3. **Step 3:** Click **Extract Structured Plan** to test AI extraction, then click **Initialize Multi-Agent Event Plan**.
4. **Step 4:** Inspect the **AI Event Planner** tab to see all 6 specialized agent outputs.
5. **Step 5:** Navigate to **What-If Simulator**, click **Scenario 1: Budget Reduction (₹10L to ₹8L)**, review suggested cuts, and optionally click **Apply Proposed Changes**.
6. **Step 6:** Explore the **Theme Studio** for color palettes & 3D mandap concepts, and **Guest Experience** for Gujarati WhatsApp invitations.
