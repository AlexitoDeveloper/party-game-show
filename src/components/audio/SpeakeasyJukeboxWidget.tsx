import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, Volume2, VolumeX, Disc, Radio } from 'lucide-react';
import { JUKEBOX_PLAYLIST, JukeboxState, JukeboxTrack } from '../../lib/audio';

interface SpeakeasyJukeboxWidgetProps {
  variant?: 'tv' | 'host' | 'compact';
  externalState?: JukeboxState;
  onCommand?: (cmd: {
    action: 'play' | 'pause' | 'toggle' | 'next' | 'prev' | 'volume' | 'mute';
    volume?: number;
    trackIndex?: number;
  }) => void;
}

export const SpeakeasyJukeboxWidget: React.FC<SpeakeasyJukeboxWidgetProps> = ({
  variant = 'compact',
  externalState,
  onCommand,
}) => {
  // Estado interno o sincronizado desde la TV
  const [internalState, setInternalState] = useState<JukeboxState>({
    isPlaying: false,
    currentTrackIndex: 0,
    currentTrack: JUKEBOX_PLAYLIST[0],
    volume: 0.35,
    isMuted: false,
    isDucked: false,
  });

  const state = externalState || internalState;

  // Track seguro con fallback exhaustivo (nunca falla incluso si el estado local o sincronizado está incompleto)
  const currentTrack: JukeboxTrack =
    state?.currentTrack ||
    (typeof (state as any)?.currentTrackIndex === 'number' && JUKEBOX_PLAYLIST[(state as any).currentTrackIndex]) ||
    (typeof (state as any)?.trackIndex === 'number' && JUKEBOX_PLAYLIST[(state as any).trackIndex]) ||
    (state as any)?.track ||
    JUKEBOX_PLAYLIST[0];

  const isPlaying = !!state?.isPlaying;
  const isMuted = !!state?.isMuted;
  const isDucked = !!state?.isDucked;
  const effectiveVolume = typeof state?.volume === 'number' ? state.volume : 0.35;

  const handleAction = (
    action: 'play' | 'pause' | 'toggle' | 'next' | 'prev' | 'volume' | 'mute',
    volume?: number,
    trackIndex?: number
  ) => {
    if (onCommand) {
      onCommand({ action, volume, trackIndex });
    }
  };

  // =========================================================================
  // VISTA TV: INDICADOR ELEGANTE ART DÉCO 100% PASIVO (NO CLICABLE, POINTER-EVENTS-NONE)
  // =========================================================================
  if (variant === 'tv') {
    const isSilenced = state.contextFactor === 0;

    return (
      <div
        className="flex items-center gap-2.5 bg-[#0c0c14]/90 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-deco-gold select-none pointer-events-none border border-[#d4af37]/45 text-left"
        aria-hidden="true"
      >
        {/* DISCO DE VINILO GIRATORIO VINTAGE 1920s */}
        <div
          className={`w-6 h-6 rounded-full bg-slate-950 border border-[#d4af37]/60 flex items-center justify-center shadow-inner shrink-0 relative overflow-hidden ${
            isPlaying && !isSilenced ? 'animate-spin' : 'opacity-70'
          }`}
          style={{ animationDuration: '4s' }}
        >
          {/* Surcos del disco */}
          <div className="absolute inset-0.5 rounded-full border border-slate-700/50" />
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-sm z-10" />
        </div>

        <div className="flex flex-col text-left min-w-0">
          <span className="text-[9px] uppercase font-vintage tracking-wider text-amber-300/80 flex items-center gap-1.5">
            <Radio className="w-2.5 h-2.5 text-amber-400 shrink-0" />
            <span>Speakeasy Jukebox</span>
            {isSilenced ? (
              <span className="text-[8px] bg-amber-500/20 text-amber-300/90 border border-amber-400/30 px-1 rounded font-bold">
                (Pausa en prueba)
              </span>
            ) : isDucked ? (
              <span className="text-[8px] text-amber-400 font-bold animate-pulse">
                (Atenuado)
              </span>
            ) : isPlaying ? (
              <span className="inline-flex items-end gap-0.5 h-2">
                <span className="w-0.5 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDuration: '0.6s' }} />
                <span className="w-0.5 h-1 bg-amber-400 rounded-full animate-pulse" style={{ animationDuration: '0.9s' }} />
                <span className="w-0.5 h-1.5 bg-amber-400 rounded-full animate-pulse" style={{ animationDuration: '0.7s' }} />
              </span>
            ) : null}
          </span>

          <span className="text-[11px] font-broadway text-amber-100 max-w-[180px] truncate leading-tight">
            {isSilenced
              ? 'Silencio para prueba'
              : currentTrack.title || 'Hilo Musical 1920s'}
          </span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VISTA HOST: CONSOLA DE CONTROL DJ REMOTO (ORDENA A LA TV REPRODUCIR)
  // =========================================================================
  return (
    <div className="bg-[#0c0c14]/90 border-2 border-[#d4af37]/40 rounded-2xl p-3.5 backdrop-blur-xl shadow-deco-gold flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-full bg-slate-950 border border-[#d4af37]/70 flex items-center justify-center shadow-inner shrink-0 ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '4s' }}
          >
            <Disc className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-vintage tracking-wider text-amber-300 font-bold">
                Mando Jukebox (Suena en TV)
              </span>
              {isDucked ? (
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded font-vintage animate-pulse">
                  Ducking Activo
                </span>
              ) : state?.contextReason ? (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-vintage border ${
                  state.contextFactor === 0 ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                  state.contextFactor && state.contextFactor < 0.5 ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {state.contextReason}
                </span>
              ) : null}
            </div>
            <h4 className="text-xs font-broadway text-white truncate">
              {currentTrack.title} - {currentTrack.artist} ({currentTrack.year})
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <button
            type="button"
            onClick={() => handleAction('prev')}
            className="w-7 h-7 rounded-xl bg-[#14141e] border border-[#d4af37]/40 text-amber-300 hover:text-white flex items-center justify-center active:scale-95 transition-all"
            title="Pista anterior en la TV"
          >
            <SkipForward className="w-3.5 h-3.5 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => handleAction('toggle')}
            className="px-3 py-1 rounded-xl bg-gold-gradient hover:brightness-110 text-slate-950 font-broadway text-xs font-black shadow-deco-gold flex items-center gap-1.5 active:scale-95 transition-all border border-[#f5eedb]/40"
            title={isPlaying ? 'Pausar música en la TV' : 'Reproducir música en la TV'}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isPlaying ? 'PAUSAR' : 'REPRODUCIR'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleAction('next')}
            className="w-7 h-7 rounded-xl bg-[#14141e] border border-[#d4af37]/40 text-amber-300 hover:text-white flex items-center justify-center active:scale-95 transition-all"
            title="Siguiente pista en la TV"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* REGULADOR DE VOLUMEN REMOTO PARA LA TV */}
      <div className="flex items-center gap-3 pt-1 border-t border-[#d4af37]/20">
        <button
          type="button"
          onClick={() => handleAction('mute')}
          className="text-amber-300 hover:text-white"
          title={isMuted ? 'Desactivar silencio' : 'Silenciar música en TV'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-red-400" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : effectiveVolume}
          onChange={(e) => handleAction('volume', parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
          title="Volumen del hilo musical en la TV"
        />
        <span className="text-[11px] font-vintage text-amber-200 w-8 text-right">
          {isMuted ? '0%' : `${Math.round(effectiveVolume * 100)}%`}
        </span>
      </div>
    </div>
  );
};

export default SpeakeasyJukeboxWidget;
