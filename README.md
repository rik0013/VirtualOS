# VirtualOS

VirtualOS is a browser-based desktop simulation built with React + Vite.

## What was added

- Launchpad overlay for launching all apps from a single grid.
- Music app with animated Spotify-style UI.
- Search-only browser shell.
- Groq-ready AI API proxy on the server.
- MongoDB-backed user accounts, preferences, desktop layout, and file system data.

## Run the client

```bash
cd client
npm install
npm run dev
```

## Run the server

```bash
cd server
copy .env.example .env
npm run dev
```

Set `MONGODB_URI` and `GROQ_API_KEY` in `server/.env` before starting the server. The server auto-loads `.env` on startup.

Default local development values are:

- `MONGODB_URI=mongodb://127.0.0.1:27017/virtualos`
- `MONGODB_DB=virtualos`
- `GROQ_MODEL=llama-3.3-70b-versatile`

## AI endpoint

The client can call `/api/ai/chat`, which is proxied to the local server in Vite dev mode. The server forwards requests to Groq's chat completions API.

Default model:

- `llama-3.3-70b-versatile`
