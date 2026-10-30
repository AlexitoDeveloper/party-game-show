import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Radio, Shield, Sparkles, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { useTvRemoteReceiver } from '../hooks/useTvRemoteReceiver';
import { Button, Input } from '../components/ui';
import { FullscreenButton } from '../components/common/FullscreenButton';

export default function TvReceiverPage() {
  const navigate = useNavigate();
  const { tvPin, liteMode, toggleLiteMode, lastPairedRoom } = useTvRemoteReceiver({
    isReceiverPage: true,
  });
  const [manualCode, setManualCode] = useState('');

  const handleManualJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualCode.trim().toUpperCase();
    if (clean.length === 4) {
      navigate(`/room/${clean}/tv`);
    }
  };

  return (
    <main className="min-h-screen bg-[#08080c] text-white flex flex-col justify-between p-6 sm:p-10 select-none relative overflow-hidden">
      {/* Resplandores Art Deco (ocultos automáticamente en lite mode) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER SUPERIOR */}
      <header className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black border-2 border-[#d4af37] flex items-center justify-center shadow-lg shadow-amber-950/40">
            <Tv className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-broadway uppercase tracking-wider text-gold-gradient">
              RECEPTOR SMART TV
            </h1>
            <p className="text-xs font-vintage text-amber-200/60">
              Auto-sincronización con el teléfono del Anfitrión
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={liteMode ? 'gold' : 'secondary'}
            size="sm"
            onClick={() => toggleLiteMode()}
            title="Activa rendimiento ultra fluido para TVs LG webOS y procesadores lentos"
          >
            <Zap className={`w-3.5 h-3.5 ${liteMode ? 'text-slate-950' : 'text-slate-500'}`} />
            <span>Modo Ligero OLED {liteMode ? '(ACTIVO)' : '(DESACTIVADO)'}</span>
          </Button>
          <FullscreenButton size="sm" showLabel={false} />
        </div>
      </header>

      {/* CUERPO CENTRAL: PIN & ESTADO */}
      <div className="max-w-2xl w-full mx-auto my-auto z-10 text-center space-y-8">
        <div className="hell-card-frame rounded-3xl p-8 sm:p-12 border-2 border-[#d4af37]/60 shadow-deco-gold bg-[#0c0c16]/95 backdrop-blur-xl relative">
          {/* Badge de Estado Activo */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/70 border border-[#d4af37]/40 mb-6">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-xs sm:text-sm font-broadway uppercase tracking-widest text-emerald-300">
              Esperando señal del móvil del Anfitrión
            </span>
          </div>

          <p className="text-xs sm:text-sm font-vintage uppercase text-amber-200/70 tracking-widest">
            PIN DE EMPAREJAMIENTO DE ESTA TV
          </p>

          {/* DÍGITOS DEL PIN GIGANTES */}
          <div className="py-4 my-2">
            <div className="font-broadway text-7xl sm:text-9xl text-gold-gradient tracking-[0.25em] pl-[0.25em] drop-shadow-2xl font-black">
              {tvPin}
            </div>
          </div>

          <p className="text-xs sm:text-sm font-vintage text-amber-100/80 max-w-md mx-auto leading-relaxed">
            Abre el panel del Anfitrión en tu <span className="text-amber-300 font-bold">Pixel 10 Pro</span> o móvil y pulsa <span className="text-amber-300 font-bold">"Enviar a TV"</span>. La pantalla saltará a la sala al instante.
          </p>

          {lastPairedRoom && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-[#d4af37]/30 text-xs font-broadway text-amber-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Última sala vinculada: {lastPairedRoom}</span>
            </div>
          )}
        </div>

        {/* ACCESO MANUAL ALTERNATIVO POR CÓDIGO */}
        <div className="max-w-sm mx-auto bg-[#0c0c14]/80 border border-[#d4af37]/30 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-broadway uppercase tracking-wider text-amber-200/70">
            O introduce el código de sala manualmente con el mando:
          </p>
          <form onSubmit={handleManualJoin} className="flex gap-2">
            <Input
              type="text"
              maxLength={4}
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="ABCD"
              className="text-center font-mono font-bold tracking-widest text-lg py-2 uppercase"
            />
            <Button
              type="submit"
              variant="gold"
              disabled={manualCode.length !== 4}
              className="shrink-0 px-4"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center text-xs font-vintage text-amber-200/40 pb-2 z-10 flex items-center justify-center gap-4">
        <span>Canal Wi-Fi / WebRTC / Supabase activo</span>
        <span>•</span>
        <span>Compatible con LG webOS 1.4-24, TCL Google TV y Samsung Tizen</span>
      </footer>
    </main>
  );
}
