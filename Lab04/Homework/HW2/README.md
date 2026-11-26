# Homework 2 — Esports Fair-Play Appeal Tribunal

Full-stack React 19 + Express + MongoDB app for the Himass & TanVuu case study.

## Requirements
- Node.js ≥ 20.6
- MongoDB (local or Atlas)

## Setup
```bash
# server
cd server
npm install
cp .env.example .env   # then edit MONGODB_URI if needed

# client
cd ../client
npm install
```

## Run
Open two terminals:
```bash
cd server && npm run dev   # http://localhost:3001
cd client && npm run dev   # http://localhost:5173
```

## Test
```bash
cd server && npm run test:run
cd client && npm run test:run
```

## Structure
- `client/` — React 19 + Vite + React Router v7
- `server/` — Express + Mongoose 8
- `shared/` — validation shared by client and server
- `docs/` — API contract and sprint contracts (screenshots live in the report)
