import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';

const ExplorePage = lazy(() => import('./pages/ExplorePage').then((module) => ({ default: module.ExplorePage })));
const CollisionLabPage = lazy(() => import('./pages/CollisionLabPage').then((module) => ({ default: module.CollisionLabPage })));

export default function App() {
  const [toastMessage, setToastMessage] = useState('');
  const timer = useRef<number | undefined>(undefined);
  const location = useLocation();

  function showPlannedMessage() {
    setToastMessage('This destination is on the flight plan — coming in a later prototype pass.');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToastMessage(''), 2800);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="site-shell">
      <Header onPlannedLink={showPlannedMessage} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage onPlannedLink={showPlannedMessage} />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/explore" element={<Suspense fallback={<div className="explore-loading">Preparing exploration systems…</div>}><ExplorePage /></Suspense>} />
          <Route path="/collision-lab" element={<Suspense fallback={<div className="explore-loading">Preparing collision lab…</div>}><CollisionLabPage /></Suspense>} />
          <Route path="*" element={<HomePage onPlannedLink={showPlannedMessage} />} />
        </Routes>
      </main>
      <Footer />
      <Toast message={toastMessage} />
    </div>
  );
}
