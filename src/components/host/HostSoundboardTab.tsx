import React from 'react';
import { Volume2 } from 'lucide-react';
import { SpeakeasyJukeboxWidget } from '../audio/SpeakeasyJukeboxWidget';
import { JukeboxState } from '../../lib/audio';

interface HostSoundboardTabProps {
  jukeboxState: JukeboxState;
  onJukeboxCommand: (cmd: any) => void;
  onPlaySoundEffect: (type: string) => void;
}

export const HostSoundboardTab: React.FC<HostSoundboardTabProps> = ({
  jukeboxState,
  onJukeboxCommand,
  onPlaySoundEffect,
}) => {
  return (
    <div className="space-y-4">
      {/* HILO MUSICAL SPEAKEASY CON CONTROL DJ REMOTO (SUENA EN LA TV) */}
      <SpeakeasyJukeboxWidget
        variant="host"
        externalState={jukeboxState}
        onCommand={onJukeboxCommand}
      />

      <section className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-6 shadow-deco-gold space-y-4 backdrop-blur-xl hell-card-frame">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#d4af37]/30 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#d4af37] to-[#8a6a1a] text-slate-950 rounded-2xl shadow-md">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-broadway text-gold-gradient uppercase tracking-wider flex items-center gap-2">
                Fonoteca & Caja de Ruidos (Soundboard)
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-bold font-vintage">
                  Sincronizado con TV
                </span>
              </h3>
              <p className="text-xs text-amber-100/70 font-vintage">
                Dispara efectos orquestales y de casino en directo para ambientar respuestas, fallos, suspense o victorias.
              </p>
            </div>
          </div>
          <span className="text-[10px] text-amber-200/80 font-mono hidden sm:inline bg-black/40 px-2 py-1 rounded-lg border border-[#d4af37]/30">
            Audio WebAPI • Suena exclusivamente en la TV
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          <button
            onClick={() => onPlaySoundEffect('fail')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-black text-xs gap-1.5 active:scale-95 transition-all shadow-md hover:border-red-400"
            title="Sonido de fallo o respuesta incorrecta"
          >
            <span className="text-2xl">❌</span>
            <span className="text-center leading-tight">Fallo / Error</span>
          </button>

          <button
            onClick={() => onPlaySoundEffect('victory')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 font-black text-xs gap-1.5 active:scale-95 transition-all shadow-md hover:border-amber-400"
            title="Fanfarria triunfal de victoria"
          >
            <span className="text-2xl">🏆</span>
            <span className="text-center leading-tight">¡Victoria!</span>
          </button>

          <button
            onClick={() => onPlaySoundEffect('success')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-black text-xs gap-1.5 active:scale-95 transition-all shadow-md hover:border-emerald-400"
            title="Acierto correcto"
          >
            <span className="text-2xl">✅</span>
            <span className="text-center leading-tight">Acierto</span>
          </button>

          <button
            onClick={() => onPlaySoundEffect('drumroll')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 font-black text-xs gap-1.5 active:scale-95 transition-all shadow-md hover:border-purple-400"
            title="Redoble de tambor con platillazo"
          >
            <span className="text-2xl">🥁</span>
            <span className="text-center leading-tight">Redoble</span>
          </button>

          <button
            onClick={() => onPlaySoundEffect('applause')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300 font-black text-xs gap-1.5 active:scale-95 transition-all shadow-md hover:border-blue-400"
            title="Aplausos del público"
          >
            <span className="text-2xl">👏</span>
            <span className="text-center leading-tight">Aplausos</span>
          </button>

          <button
            onClick={() => onPlaySoundEffect('airhorn')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/40 text-orange-300 font-black text-xs gap-1.5 active:scale-95 transition-all shadow-md hover:border-orange-400"
            title="Bocinazo DJ / Fiesta"
          >
            <span className="text-2xl">📢</span>
            <span className="text-center leading-tight">Airhorn</span>
          </button>

          <button
            onClick={() => onPlaySoundEffect('suspense')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 font-black text-xs gap-1.5 active:scale-95 transition-all shadow-md hover:border-indigo-400"
            title="Golpe de misterio y tensión"
          >
            <span className="text-2xl">😨</span>
            <span className="text-center leading-tight">Tensión</span>
          </button>

          <button
            onClick={() => onPlaySoundEffect('buzzer')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-yellow-950/40 hover:bg-yellow-900/60 border border-yellow-500/40 text-yellow-300 font-black text-xs gap-1.5 active:scale-95 transition-all shadow-md hover:border-yellow-400"
            title="Sonido de pulsador arcade"
          >
            <span className="text-2xl">⚡</span>
            <span className="text-center leading-tight">Pulsador</span>
          </button>
        </div>

        {/* SECCIÓN TEMÁTICA: EFECTOS 1930s SPEAKEASY & CASINO */}
        <div className="pt-4 border-t border-amber-500/20 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎷</span>
            <div>
              <h4 className="text-xs font-broadway uppercase tracking-wider text-gold-gradient">
                Efectos Temáticos Speakeasy & Casino 1930s
              </h4>
              <p className="text-[11px] text-amber-200/70 font-vintage">
                Sonidos táctiles procedimentales de naipes, fichas de casino y metales de big band.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <button
              onClick={() => onPlaySoundEffect('card_snap')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#160e08] hover:bg-[#22150c] border border-amber-500/40 text-amber-200 font-vintage font-bold text-xs gap-1 active:scale-95 transition-all shadow-deco-gold"
              title="Chasquido nítido de naipe sobre tapete verde"
            >
              <span className="text-2xl">🎴</span>
              <span className="text-center leading-tight">Chasquido Carta</span>
            </button>

            <button
              onClick={() => onPlaySoundEffect('card_slam')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-amber-950/70 to-[#120b06] hover:brightness-110 border border-[#d4af37] text-amber-300 font-broadway font-bold text-xs gap-1 active:scale-95 transition-all shadow-deco-gold"
              title="Impacto cinemático de naipe con resplandor mágico"
            >
              <span className="text-2xl animate-pulse">💥</span>
              <span className="text-center leading-tight">Impacto Naipe</span>
            </button>

            <button
              onClick={() => onPlaySoundEffect('chips')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#160e08] hover:bg-[#22150c] border border-amber-500/40 text-amber-200 font-vintage font-bold text-xs gap-1 active:scale-95 transition-all shadow-deco-gold"
              title="Tintineo de fichas de casino de arcilla"
            >
              <span className="text-2xl">🪙</span>
              <span className="text-center leading-tight">Fichas Casino</span>
            </button>

            <button
              onClick={() => onPlaySoundEffect('deco_bell')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#160e08] hover:bg-[#22150c] border border-amber-500/40 text-amber-200 font-vintage font-bold text-xs gap-1 active:scale-95 transition-all shadow-deco-gold"
              title="Campana de conserje / boxeo 1930s"
            >
              <span className="text-2xl">🛎️</span>
              <span className="text-center leading-tight">Campana Déco</span>
            </button>

            <button
              onClick={() => onPlaySoundEffect('speakeasy_brass')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#160e08] hover:bg-[#22150c] border border-amber-500/40 text-amber-200 font-vintage font-bold text-xs gap-1 active:scale-95 transition-all shadow-deco-gold"
              title="Fanfarria de metales Big Band años 30"
            >
              <span className="text-2xl">🎺</span>
              <span className="text-center leading-tight">Brass 1930s</span>
            </button>

            <button
              onClick={() => onPlaySoundEffect('wah_wah')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#160e08] hover:bg-[#22150c] border border-amber-500/40 text-amber-200 font-vintage font-bold text-xs gap-1 active:scale-95 transition-all shadow-deco-gold"
              title="Trompeta cómica Rubber-Hose Wah-Wah"
            >
              <span className="text-2xl">🤡</span>
              <span className="text-center leading-tight">Wah-Wah Fail</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
