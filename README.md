# IVTech

Monorepo with a React client and an Express server.

## Structure

- `client/` — React + TypeScript (Vite), Redux Toolkit + RTK Query
- `server/` — Node.js + Express + TypeScript

## Getting started

### Server

Requires a running MongoDB instance. Either run one yourself and set `MONGODB_URI` in `server/.env` (see `server/.env.example`), or bring one up via Docker:

```bash
docker compose up -d mongo
```

Then:

```bash
cd server
npm install
npm run dev
```

Runs on `http://localhost:4000` by default (override with `PORT` in `.env`).

Seed the database with sample users (including `amit` / `123`):

```bash
npm run seed
```

#### Docker

`docker compose up --build` builds the server image and starts it alongside MongoDB — no local Node/Mongo install needed. Set `JWT_SECRET` in a root `.env` (see `.env.example`) or it falls back to a dev default. The server is reachable at `http://localhost:4000` either way.

### Client

```bash
cd client
npm install
npm run dev
```

Runs on the Vite dev server; requests to `/api` are proxied to the server.
