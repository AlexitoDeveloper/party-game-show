import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Smartphone, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function HomePage() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCode.trim().toUpperCase();
    if (cleanCode.length === 4) {
      navigate(`/room/${cleanCode}/play`);
    }
  };

  const handleCreateRoom = async () => {
    setIsCreating(true);
    // Generar código aleatorio de 4 letras consonantes fáciles de pronunciar
    const letters = 'BCDFGHJKLMNPQRSTVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    const hostToken = 'host_' + Math.random().toString(36).substring(2, 12);
    const finalTitle = customTitle.trim() || 'GAME SHOW ARENA';

    if (isSupabaseConfigured) {
      try {
        await supabase.rpc('create_game_room', {
          p_code: code,
          p_host_token: hostToken,
          p_teams_count: 5,
        });
      } catch (err) {
        console.warn('Error llamando RPC de Supabase, procediendo en modo cliente:', err);
      }
    }

    localStorage.setItem(`party_host_token_${code}`, hostToken);
    localStorage.setItem(`party_room_title_${code}`, finalTitle);
    localStorage.setItem(
      `party_room_${code}`,
      JSON.stringify({
        id: 'room_' + code,
        code,
        host_token: hostToken,
        status: 'lobby',
        active_teams_count: 5,
        current_game: 'buzzer',
        active_game_id: 'music',
        title: finalTitle,
      })
    );
    navigate(`/room/${code}/host`);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Resplandores Neón de Fondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER */}
      <header className="text-center pt-8 z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400 mb-4 shadow-lg">
          <Sparkles className="w-3.5 h-3.5" /> Jackbox / Kahoot Style Party Arena
        </div>
        <h1 className="text-5xl md:text-7xl font-black uppercase font-arcade tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-pink-500 to-purple-400 drop-shadow-sm">
          GAME SHOW ARENA
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto mt-3">
          Móviles convertidos en pulsadores arcade y pantalla de proyector para tus reuniones sociales.
        </p>
      </header>

      {/* CONTENEDOR CENTRAL DE ACCESO */}
      <div className="max-w-md w-full mx-auto my-auto z-10 space-y-6">
        {/* UNIRSE COMO JUGADOR */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Entrar como Jugador</h2>
              <p className="text-xs text-slate-400">Introduce las 4 letras de la pantalla</p>
            </div>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              maxLength={4}
              placeholder="ABCD"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl py-3.5 text-center text-3xl font-black font-mono tracking-widest text-amber-400 uppercase placeholder:text-slate-700 focus:outline-none focus:border-amber-400 shadow-inner"
            />
            <button
              type="submit"
              disabled={roomCode.length !== 4}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-4 rounded-2xl uppercase tracking-wider text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all"
            >
              <span>Conectar Mando</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* CREAR SALA COMO ANFITRIÓN */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">¿Eres el Anfitrión?</h3>
              <p className="text-xs text-slate-400">Crea una nueva sala para la TV</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Título del Evento / Show:
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="GAME SHOW ARENA (o tu título personalizado)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-400"
            />
            <p className="text-[10px] text-slate-500">
              Sustituye el rótulo "GAME SHOW ARENA" en la pantalla de la TV (ej: Cumpleaños de Alex, Fiestón 2026...)
            </p>
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 active:scale-95 transition-all"
          >
            <Crown className="w-4 h-4" />
            <span>{isCreating ? 'Iniciando Sala...' : 'Crear Sala para la TV'}</span>
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center text-xs text-slate-600 pb-4 z-10">
        Plataforma Web Responsive sin instalaciones • Soporta 2 a 6 equipos en vivo
      </footer>
    </main>
  );
}
