import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TvView from './pages/TvView';
import PlayerView from './pages/PlayerView';
import HostView from './pages/HostView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:code/tv" element={<TvView />} />
        <Route path="/room/:code/play" element={<PlayerView />} />
        <Route path="/room/:code/host" element={<HostView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
