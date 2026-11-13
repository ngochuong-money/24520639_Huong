import { lazy, Suspense } from 'react';
import { Link, Navigate, Routes, Route } from 'react-router';
import PeopleLayout from './PeopleLayout.jsx';
import Skeleton from './Skeleton.jsx';
import './App.css';

const PersonDetail = lazy(() => import('./PersonDetail'));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/people" replace />} />
      <Route path="people" element={<PeopleLayout />}>
        <Route
          index
          element={<p className="detail-pane">Select a person to view their details.</p>}
        />
        <Route
          path=":id"
          element={
            <Suspense fallback={<Skeleton aria-busy="true" aria-live="polite" />}>
              <PersonDetail />
            </Suspense>
          }
        />
      </Route>
      <Route
        path="*"
        element={
          <main>
            <h1>Page not found</h1>
            <Link to="/people">Back to people</Link>
          </main>
        }
      />
    </Routes>
  );
}
