import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import JoinPage from './pages/JoinPage';
import LobbyPage from './pages/LobbyPage';
import PlayPage from './pages/PlayPage';
import ResultPage from './pages/ResultPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/join" replace />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/lobby/:gameId" element={<LobbyPage />} />
        <Route path="/play/:gameId" element={<PlayPage />} />
        <Route path="/result/:gameId" element={<ResultPage />} />
        <Route path="/admin/:gameId" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
