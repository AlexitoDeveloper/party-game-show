import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Smartphone, Crown, Sparkles, ArrowRight, Monitor, Laptop } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { pushRoomToTv } from '../lib/tvPairing';
import { Button, Input } from '../components/ui';

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

  const createRoomInstance = async () => {
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

    // Emparejar automáticamente a cualquier TV que esté a la espera en /tv
    pushRoomToTv(code, { title: finalTitle });

    return { code, hostToken, finalTitle };
  };

  const handleCreateAsHost = async () => {
    setIsCreating(true);
    const { code } = await createRoomInstance();
    navigate(`/room/${code}/host`);
  };

  const handleCreateForLaptopHdmi = async () => {
    setIsCreating(true);
    const { code } = await createRoomInstance();
    // Abrir mando anfitrión en una nueva pestaña
    window.open(`/room/${code}/host`, '_blank');
    // Navegar en la pantalla actual a la vista de TV (ideal para pantalla extendida o duplicada por HDMI)
    navigate(`/room/${code}/tv`);
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
            <Input
              type="text"
              maxLength={4}
              placeholder="ABCD"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl py-3.5 text-center text-3xl font-black font-mono tracking-widest text-amber-400 uppercase placeholder:text-slate-700 focus:outline-none focus:border-amber-400 shadow-inner"
            />
            <Button
              type="submit"
              variant="gold"
              size="lg"
              fullWidth
              disabled={roomCode.length !== 4}
              className="shadow-lg shadow-orange-500/20"
            >
              <span>Conectar Mando</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Button>
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
            <Input
              label="Título del Evento / Show:"
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="GAME SHOW ARENA (o tu título personalizado)"
              helperText="Sustituye el rótulo 'GAME SHOW ARENA' en la pantalla de la TV (ej: Cumpleaños de Alex, Fiestón 2026...)"
            />
          </div>

          <div className="space-y-2 pt-1">
            <Button
              type="button"
              variant="gold"
              size="md"
              fullWidth
              onClick={handleCreateAsHost}
              disabled={isCreating}
              isLoading={isCreating}
              className="shadow-md shadow-amber-500/20"
            >
              <Crown className="w-4 h-4 shrink-0" />
              <span>Crear Sala (Mando Anfitrión)</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="md"
              fullWidth
              onClick={handleCreateForLaptopHdmi}
              disabled={isCreating}
              className="border-purple-500/50 hover:border-purple-400 text-purple-200"
            >
              <Laptop className="w-4 h-4 shrink-0 text-purple-400" />
              <span>Crear y Abrir Pantalla TV (Portátil HDMI)</span>
            </Button>
          </div>
        </div>

        {/* MODO PANTALLA TV (RECEPTOR SMART TV) */}
        <div className="bg-slate-900/40 border border-[#d4af37]/30 hover:border-[#d4af37]/60 rounded-3xl p-4 backdrop-blur-sm flex items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl shrink-0 border border-[#d4af37]/30">
              <Monitor className="w-5 h-5" />
            </div>
            <div className="min-w-0 text-left">
              <h3 className="text-xs sm:text-sm font-bold text-amber-200 truncate">Modo Pantalla TV</h3>
              <p className="text-[11px] text-slate-400 truncate">Para navegadores de Smart TV o Proyector (/tv)</p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate('/tv')}
            className="shrink-0"
          >
            Abrir TV
          </Button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center text-xs text-slate-600 pb-4 z-10">
        Plataforma Web Responsive sin instalaciones • Soporta 2 a 6 equipos en vivo
      </footer>
    </main>
  );
}
