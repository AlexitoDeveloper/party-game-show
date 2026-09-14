import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const HomePage = lazy(() => import('./pages/HomePage'));
const TvView = lazy(() => import('./pages/TvView'));
const PlayerView = lazy(() => import('./pages/PlayerView'));
const HostView = lazy(() => import('./pages/HostView'));

function ArtDecoLoader() {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0e] flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="hell-card-frame rounded-3xl p-8 max-w-sm w-full relative z-10 space-y-4 backdrop-blur-xl border border-[#d4af37]/40 shadow-deco-gold">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-black/80 border-2 border-[#d4af37] flex items-center justify-center shadow-lg shadow-amber-950/60 animate-pulse">
          <span className="text-2xl animate-spin" style={{ animationDuration: '3s' }}>⚡</span>
        </div>
        <div>
          <h2 className="text-xl font-broadway uppercase text-gold-gradient tracking-wider">
            ABRIENDO EL CLUB
          </h2>
          <p className="text-xs font-vintage text-amber-200/70 mt-1">
            Sintonizando la frecuencia clandestina 1930...
          </p>
        </div>
        <div className="flex justify-center items-center gap-2 text-xs text-[#d4af37]/50 pt-2">
          <span>♠</span>
          <span>♥</span>
          <span>♣</span>
          <span>♦</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<ArtDecoLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/room/:code/tv" element={<TvView />} />
          <Route path="/room/:code/play" element={<PlayerView />} />
          <Route path="/room/:code/host" element={<HostView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
