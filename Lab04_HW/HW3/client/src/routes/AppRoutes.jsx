import { Routes, Route, Navigate } from 'react-router';
import PhotoGalleryLayout from '../components/PhotoGalleryLayout.jsx';

// Minimal wiring — WBS 3.4 adds React.lazy + <Suspense fallback={<GallerySkeleton />}> + 404
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/gallery" replace />} />
      <Route path="/gallery" element={<PhotoGalleryLayout />} />
    </Routes>
  );
}
