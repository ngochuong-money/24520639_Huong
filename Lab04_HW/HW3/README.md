# Homework 3 — Photo Gallery with URL-Synced `<dialog>`

React 19 + Vite + React Router v7 photo gallery. The open photo lives in the URL
(`/gallery?photoId=<id>`), so a modal view can be shared, reloaded and closed with the browser Back button.
The modal is the native HTML5 `<dialog>` opened with `showModal()`, which traps focus and handles Esc.

## Requirements
- Node.js ≥ 20

## Setup
```powershell
cd client
npm.cmd install
node scripts/generate-placeholders.mjs   # only if public/photos/ is empty
```

## Run
```powershell
cd client
npm.cmd run dev        # http://localhost:5173/gallery
```

## Test
```powershell
cd client
npm.cmd run test:run   # Vitest + Testing Library (jsdom; <dialog> polyfilled in tests/setup.js only)
npm.cmd run lint
npm.cmd run build
```

## Try it
- Open a photo → URL becomes `/gallery?photoId=arena-stage`
- Reload → the same photo is still open
- Press Esc, the Close button or browser Back → `photoId` leaves the URL, and focus returns to the thumbnail
- `/gallery?photoId=unknown` → "Photo not found." notice; no empty dialog

## Structure
- `client/src/components/` — `PhotoGalleryLayout`, `PhotoGrid`, `PhotoDialog`, `GallerySkeleton`, `NotFoundState`
- `client/src/data/photos.js` — gallery seed
- `client/public/photos/` — images (placeholder SVGs or your own CC0 photos)
- `docs/HW3_CONTRACT.md` — routes, URL state and component contract
