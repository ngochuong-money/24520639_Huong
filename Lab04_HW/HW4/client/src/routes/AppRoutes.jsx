import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import AppLayout from '../components/AppLayout.jsx';
import NotFoundState from '../components/NotFoundState.jsx';

const SwipePage = lazy(() => import('../components/SwipePage.jsx'));
const DossierView = lazy(() => import('../components/DossierView.jsx'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/swipe" replace />} />
        <Route path="swipe" element={<SwipePage />} />
        <Route path="dossier/:playerID" element={<DossierView />} />
        <Route path="*" element={<NotFoundState />} />
      </Route>
    </Routes>
  );
}
