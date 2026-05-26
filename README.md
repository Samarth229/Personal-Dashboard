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
| Frontend | React 18, Vite, Three.js |
| Backend | Node.js, Express |
| Database | SQLite |
| Auth | Google OAuth 2.0 (backend-driven), JWT |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Google Cloud Console project with OAuth 2.0 credentials
- API keys for the services you want to connect

### 1. Clone the repo
```bash
git clone https://github.com/your-username/personal-dashboard.git
cd personal-dashboard
