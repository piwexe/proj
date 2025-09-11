import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StartPage from './pages/StartPage';
import SchemePage from './pages/SchemePage';
import PlanePage from './pages/PlanePage';
import PositionPage from './pages/PositionPage';
import LoadPage from './pages/LoadPage';
import EnvironmentPage from './pages/EnvironmentPage';
import ResultPage from './pages/ResultPage';
import { useEffect } from 'react';
import { initStorageOnReload } from './utils/storage';

function App() {
  useEffect(() => {
    initStorageOnReload(); // очистит хранилище при перезагрузке
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/scheme" element={<SchemePage />} />
        <Route path="/plane" element={<PlanePage />} />
        <Route path="/position" element={<PositionPage />} />
        <Route path="/load" element={<LoadPage />} />
        <Route path="/environment" element={<EnvironmentPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </Router>
  );
}

export default App;
