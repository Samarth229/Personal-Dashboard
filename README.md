# Personal Dashboard

**Live:** [personal-dashboard-mauve-two.vercel.app](https://personal-dashboard-mauve-two.vercel.app/login)

A self-hosted personal hub that pulls your Spotify, GitHub, Gmail, Steam, Riot Games, and Letterboxd data into one clean dashboard. Enter your email, verify with a one-time code, connect your services, and see everything in one place.

---

## Features

| Service | What you get |
|---|---|
| **Spotify** | Top artists, top tracks, recently played |
| **GitHub** | Repos, commits, contribution graph |
| **Gmail** | Unread count, recent emails |
| **Steam** | Game library, playtime, recently played |
| **Riot Games** | Summoner stats, rank, match history |
| **Letterboxd** | Recent films and ratings (RSS-based) |

- 🔐 **Google OAuth login** — one-click sign-in, no passwords stored
- 📧 **OTP verification** for new accounts via email
- 🌙 **Dark glass UI** with animated Three.js background
- ⚙️ **Settings page** — connect, reconnect, or disconnect any service

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Three.js (`@react-three/fiber`) |
| Backend | Node.js, Express |
| Database | SQLite (`better-sqlite3`) |
| Auth | Google OAuth 2.0 (backend-driven), JWT |
| Email | SendGrid HTTP API (OTP delivery) |
| Deploy | Render (backend) + Vercel (frontend) |

---

## Local Setup

### Prerequisites

- Node.js 18+
- A [Google Cloud Console](https://console.cloud.google.com) project with OAuth 2.0 credentials
- Optional: API keys for Spotify, GitHub, Steam, Riot

### 1. Clone

```bash
git clone https://github.com/Samarth229/personal-dashboard.git
cd personal-dashboard
```

### 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment variables

```bash
cp backend/.env.example backend/.env
```

Fill in your values in `backend/.env`. The minimum to get the app running locally:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=any_long_random_string
JWT_REFRESH_SECRET=another_long_random_string

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Create `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_BACKEND_URL=http://localhost:5000
```

### 4. Google Cloud Console

In your OAuth 2.0 client, add this **Authorized Redirect URI**:

```
http://localhost:5000/api/auth/google/login-callback
```

> The login flow is backend-driven — only the backend redirect URI needs to be registered, not the frontend origin.

### 5. Run

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Deployment (Render + Vercel)

### Backend → Render

1. New Web Service → connect your GitHub repo
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `node src/server.js`
5. Add environment variables (all from `.env.example`), plus:
   - `BACKEND_URL` = your Render URL (e.g. `https://your-app.onrender.com`)
   - `FRONTEND_URL` = your Vercel URL

### Frontend → Vercel

1. New Project → connect your GitHub repo
2. **Root Directory:** `frontend`
3. **Framework Preset:** Vite
4. Add environment variables:
   - `VITE_GOOGLE_CLIENT_ID` = your Google client ID
   - `VITE_BACKEND_URL` = your Render URL

### After deploying

Update your OAuth redirect URIs in Google Cloud Console, Spotify, and GitHub to use the live URLs.

---

## Email (OTP Delivery)

New user signups require an OTP sent to their email. This uses [SendGrid](https://sendgrid.com) (free, 100 emails/day, sends to any recipient):

1. Create a free account at [sendgrid.com](https://sendgrid.com)
2. Go to **Settings → Sender Authentication → Single Sender Verification** → verify your sender email
3. Go to **Settings → API Keys** → create a key with **Mail Send** permission only
4. Add to your environment:
   ```env
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

> Uses the SendGrid HTTP API (not SMTP) — works on Render and all cloud hosts.
> Without this set, OTPs are logged to the console in dev mode but not emailed.

---

## Project Structure

```
personal-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/        # env.js, database.js
│   │   ├── middleware/    # auth, rate limiting
│   │   ├── models/        # User, DataSource, DataPoint
│   │   ├── routes/        # auth, spotify, github, gmail, steam, riot, letterboxd
│   │   ├── services/      # per-service data fetching, emailService
│   │   └── utils/         # JWT helpers, logger, error handler
│   ├── data/              # SQLite .db file (gitignored)
│   └── .env.example
└── frontend/
    └── src/
        ├── components/    # Dashboard cards, Settings, Three.js scenes
        ├── context/       # AuthContext
        ├── hooks/         # useAuth
        ├── pages/         # LoginPage, DashboardPage, SettingsPage, service pages
        └── services/      # axios API client
```

---

## License

MIT
