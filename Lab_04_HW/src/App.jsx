import { Navigate, Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout.jsx'
import NotFoundState from './components/NotFoundState.jsx'
import DeckPage from './features/deck/DeckPage.jsx'
import GalleryPage from './features/gallery/GalleryPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/gallery" replace />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="deck" element={<DeckPage />} />
        <Route path="*" element={<NotFoundState />} />
      </Route>
    </Routes>
  )
}
