# Personal Dashboard

A self-hosted personal dashboard that aggregates your Spotify, GitHub, Gmail, Steam, Riot Games, and Letterboxd data in one place. Sign in with Google, connect your services, and get a live overview of everything you care about.

---

## Features

- **Google OAuth** — one-click sign-in, no passwords
- **Spotify** — top artists, top tracks, recently played
- **GitHub** — repos, commits, contribution activity
- **Gmail** — unread count and recent emails
- **Steam** — library, playtime, recently played games
- **Riot Games** — summoner stats and match history
- **Letterboxd** — recent films and ratings
- **Dashboard** — animated floating cards with live data from all connected sources
- **Settings** — manage connected accounts, update profile, reconnect or change any service

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Three.js (`@react-three/fiber`) |
| Backend | Node.js, Express |
| Database | SQLite (via `better-sqlite3`) |
| Auth | Google OAuth 2.0 (backend-driven), JWT |
| Styling | Inline styles, dark glass UI |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google Cloud Console](https://console.cloud.google.com) project with OAuth 2.0 credentials
- API keys for whichever services you want to connect (Spotify, GitHub, etc.)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/personal-dashboard.git
cd personal-dashboard
```

### 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment variables

Copy the example and fill in your values:

```bash
cp backend/.env.example backend/.env
```

**`backend/.env` — required fields:**

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret

# Google OAuth (used for login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Spotify
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:5000/api/spotify/callback

# GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Gmail (uses same Google OAuth credentials)
GMAIL_REDIRECT_URI=http://localhost:5000/api/gmail/callback
```

**`frontend/.env`:**

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Google Cloud Console setup

In your OAuth 2.0 Client, add the following **Authorized redirect URI**:

```
http://localhost:5000/api/auth/google/login-callback
```

> This only needs to be set once — it points to the backend and never changes regardless of frontend port.

### 5. Run

```bash
# Terminal 1 — backend
cd backend && node src/server.js

# Terminal 2 — frontend
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Project Structure

```
personal-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/        # Env, database
│   │   ├── middleware/    # Auth, rate limiting
│   │   ├── models/        # User, DataSource, DataPoint
│   │   ├── routes/        # Auth, Spotify, GitHub, Gmail, Steam, Riot, Letterboxd
│   │   ├── services/      # Per-service fetch + sync engine
│   │   └── utils/         # JWT, validators, error handler
│   └── data/              # SQLite database file (gitignored)
└── frontend/
    └── src/
        ├── components/    # Dashboard, Settings, Three.js scenes
        ├── context/       # Auth context
        ├── hooks/         # useAuth
        ├── pages/         # Login, Dashboard, Settings, per-service pages
        └── services/      # API client
```

---

## License

MIT
