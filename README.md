# IVTech

Monorepo with a React client and an Express server.

## Structure

- `client/` — React + TypeScript (Vite), Redux Toolkit + RTK Query
- `server/` — Node.js + Express + TypeScript

## Getting started

### Server

```bash
cd server
npm install
npm run dev
```

Runs on `http://localhost:4000` by default (override with `PORT` in `.env`).

### Client

```bash
cd client
npm install
npm run dev
```

Runs on the Vite dev server; requests to `/api` are proxied to the server.
