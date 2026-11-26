import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import GallerySkeleton from '../components/GallerySkeleton.jsx';
import NotFoundState from '../components/NotFoundState.jsx';

const PhotoGalleryLayout = lazy(() => import('../components/PhotoGalleryLayout.jsx'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/gallery" replace />} />
      <Route
        path="/gallery"
        element={
          <Suspense fallback={<GallerySkeleton />}>
            <PhotoGalleryLayout />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFoundState />} />
    </Routes>
  );
}
