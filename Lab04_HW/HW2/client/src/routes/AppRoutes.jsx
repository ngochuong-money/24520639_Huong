import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { players } from '../data/players.js';
import PeopleLayout from '../components/PeopleLayout.jsx';
import SelectCase from '../components/SelectCase.jsx';
import NotFoundState from '../components/NotFoundState.jsx';

const PersonDetail = lazy(() => import('../components/PersonDetail.jsx'));
const AppealPage = lazy(() => import('../components/AppealPage.jsx'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dossier" replace />} />
      <Route path="/dossier" element={<PeopleLayout players={players} />}>
        <Route index element={<SelectCase />} />
        <Route path=":playerID" element={<PersonDetail players={players} />}>
          <Route path="appeal" element={<AppealPage />} />
        </Route>
      </Route>
      <Route
        path="*"
        element={
          <main className="content-area">
            <NotFoundState title="Page not found" />
          </main>
        }
      />
    </Routes>
  );
}
