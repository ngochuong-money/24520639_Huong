import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout.jsx'
import NotFoundState from './components/NotFoundState.jsx'
import Skeleton from './components/Skeleton.jsx'

// Route-level code splitting: each page is its own chunk with its own Suspense boundary,
// so the layout (header and nav) stays on screen while a page loads.
const GalleryPage = lazy(() => import('./features/gallery/GalleryPage.jsx'))
const DeckPage = lazy(() => import('./features/deck/DeckPage.jsx'))

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/gallery" replace />} />
        <Route
          path="gallery"
          element={
            <Suspense fallback={<Skeleton variant="gallery" />}>
              <GalleryPage />
            </Suspense>
          }
        />
        <Route
          path="deck"
          element={
            <Suspense fallback={<Skeleton variant="deck" />}>
              <DeckPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundState />} />
      </Route>
    </Routes>
  )
}
