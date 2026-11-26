# Homework 4 — "Hen Ho Nhung Khong Yeu" SwipeDeck + Fair-Play Appeal Portal

Full-stack React 19 + Express + MongoDB app with two areas:

- **`/swipe`** — a deck of fictional profiles. Swipe left / right / up by dragging, with ArrowLeft / ArrowRight / ArrowUp, or with the Nope / Like / Super buttons. Backspace or Undo pops the last swipe (LIFO). The score is derived from the swipe history: Like +10, Super +15, Nope −5.
- **`/dossier/:playerID`** — Himass and TanVuu case files with a derived Disproportionality Matrix and a zero-drift appeal SLA countdown.

## Requirements
- Node.js ≥ 20.6
- MongoDB (local or Atlas)

## Setup
```powershell
# server
cd server
npm.cmd install
Copy-Item .env.example .env      # then edit MONGODB_URI if needed
npm.cmd run seed                 # load the fictional profiles (available after WBS 2.2)

# client
cd ../client
npm.cmd install
node scripts/generate-avatars.mjs   # only if public/avatars/ is empty
```

## Run
Open two terminals:
```powershell
cd server; npm.cmd run dev    # http://localhost:3001 — exits immediately if MONGODB_URI is missing
cd client; npm.cmd run dev    # http://localhost:5173
```

## Test
```powershell
cd server; npm.cmd run test:run   # supertest + in-memory MongoDB
cd client; npm.cmd run test:run   # Vitest + Testing Library
cd client; npm.cmd run lint; npm.cmd run build
```

## Try it
- `/swipe`: press → to like, ← to pass, ↑ to super-like, Backspace to undo, or use the buttons
- Drag a card more than ~80 px to swipe it; a short drag snaps back
- `/dossier/himass` vs `/dossier/tanvuu`: compare the matrix verdicts and the countdown (TanVuu's window is closed)
- `/dossier/unknown` → 404 inside the layout

## Structure
- `client/` — React 19 + Vite + React Router v7
- `server/` — Express + Mongoose 8 (`config.js` validates the environment)
- `shared/` — rules and pure functions used by both sides (score, swipe validation, matrix, players)
- `docs/` — HW4 contract and API contract

All profiles are fictional; avatars are generated placeholders.
