# VirtualOS

VirtualOS is a browser-based desktop simulation built with React + Vite.

## What was added

- Launchpad overlay for launching all apps from a single grid.
- Music app with animated Spotify-style UI.
- Search-only browser shell.
- Groq-ready AI API proxy on the server.

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

Set `GROQ_API_KEY` in `server/.env` before calling the AI endpoint. The server auto-loads `.env` on startup.

## AI endpoint

The client can call `/api/ai/chat`, which is proxied to the local server in Vite dev mode. The server forwards requests to Groq's chat completions API.

Default model:

- `llama-3.1-70b-versatile`
