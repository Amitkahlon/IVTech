# IVTech

A small Q&A app: React client + Node/Express/MongoDB server, with JWT auth.

- `client/` — React + TypeScript (Vite), Redux Toolkit + RTK Query
- `server/` — Node.js + Express + TypeScript + MongoDB (Mongoose)

## Prerequisites

- Node.js 20+
- A MongoDB instance — either your own local install, or Docker (see step 1)

## 1. Start MongoDB

Use your own local MongoDB and skip to step 2, or start one with Docker from the repo root:

```bash
docker compose up -d mongo
```

## 2. Run the server

```bash
cd server
npm install
cp .env.example .env   # then set JWT_SECRET to any string
npm run dev
```

The server runs at `http://localhost:4000`.

## 3. Seed the database

In a separate terminal:

```bash
cd server
npm run seed
```

This creates 7 sample users. All of them log in with the password pattern `<username>-P@ss<N>` (e.g. `alice-P@ss1`), except:

- **username:** `amit`
- **password:** `123`

## 4. Run the client

In another terminal:

```bash
cd client
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`). Requests to `/api` are proxied to the server on port 4000.

## 5. Log in

Log in with `amit` / `123` (or any other seeded user) to reach the app.

## Alternative: run the server with Docker

Instead of steps 1–2, you can build and run the server itself in Docker too:

```bash
docker compose up --build
```

This starts both MongoDB and the server together. Then run step 3 (`npm run seed`, from your machine — it connects to `localhost:27017`, which Docker Compose exposes) and step 4 as normal.
