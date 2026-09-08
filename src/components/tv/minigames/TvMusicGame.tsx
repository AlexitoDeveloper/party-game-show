import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Crown, Sparkles, Radio } from 'lucide-react';
import { SongTrack } from '../../../lib/musicData';
import { BuzzerPressPayload, Player } from '../../../lib/types';
import { DiceBearStyle, generateAvatarDataUri } from '../../../lib/dicebear';
import { TwemojiText } from '../../TwemojiText';

export interface TvMusicGameProps {
  currentSong: SongTrack | null;
  musicPlaying: boolean;
  buzzerLocked: boolean;
  musicRevealed: boolean;
  buzzerWinner: BuzzerPressPayload | null;
  players: Player[];
  isWinnerCaptain: boolean;
}

export const TvMusicGame: React.FC<TvMusicGameProps> = ({
  currentSong,
  musicPlaying,
  buzzerLocked,
  musicRevealed,
  buzzerWinner,
  players,
  isWinnerCaptain,
}) => {
  // ESCENARIO EN ESPERA: SIN CANCIÓN SELECCIONADA
  if (!currentSong) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <div className="w-full hell-card-frame rounded-3xl p-6 sm:p-10 relative overflow-hidden text-center">
          {/* Esquinas con palos de póker */}
          <span className="absolute top-3 left-4 text-sm text-[#d4af37]/50 select-none">♠</span>
          <span className="absolute top-3 right-4 text-sm text-red-600/60 select-none">♥</span>
          <span className="absolute bottom-3 left-4 text-sm text-[#d4af37]/50 select-none">♣</span>
          <span className="absolute bottom-3 right-4 text-sm text-red-600/60 select-none">♦</span>

          {/* Halo de luz carmesí y oro */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-48 bg-red-950/30 blur-[100px] pointer-events-none" />

          {/* Ilustración Rubber Hose 1930s del Gramófono */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 rounded-2xl overflow-hidden border-2 border-[#d4af37]/60 shadow-deco-gold p-1 bg-black">
            <img
              src="/cards/speakeasy_gramophone.jpg"
              alt="Gramófono Speakeasy"
              className="w-full h-full object-cover rounded-xl filter contrast-110"
            />
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-[#d4af37]/40 pointer-events-none" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-black/80 border border-[#d4af37]/50 text-[#d4af37] text-xs font-broadway uppercase tracking-widest mb-2 shadow-inner">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>FONOTECA CLANDESTINA 1930</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-broadway uppercase text-gold-emboss tracking-wider">
            ESPERANDO SELECCIÓN MUSICAL
          </h3>
          <p className="text-xs sm:text-sm font-vintage text-amber-100/70 max-w-lg mx-auto mt-2 leading-relaxed">
            El Anfitrión está eligiendo un disco en la vitrola desde su consola secreta... ¡Afilad vuestros oídos y preparaos para pulsar el timbre!
          </p>
        </div>
      </div>
    );
  }

  const winnerPlayer = buzzerWinner
    ? players.find((p) => p.id === buzzerWinner.playerId || p.nickname === buzzerWinner.playerName)
    : null;
  const winnerSeed = buzzerWinner?.avatarSeed || winnerPlayer?.avatar_seed || buzzerWinner?.playerName || 'player';
  const winnerStyle = (buzzerWinner?.avatarStyle || winnerPlayer?.avatar_style || 'avataaars') as DiceBearStyle;
  const winnerEmoji = buzzerWinner?.badgeEmoji || winnerPlayer?.badge_emoji;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <div className="w-full hell-card-frame rounded-3xl p-5 sm:p-7 relative overflow-hidden backdrop-blur-xl">
        {/* Adornos en las 4 esquinas con los palos de la baraja */}
        <span className="absolute top-3 left-4 text-base text-[#d4af37]/60 font-bold select-none">♠</span>
        <span className="absolute top-3 right-4 text-base text-red-600/70 font-bold select-none">♥</span>
        <span className="absolute bottom-3 left-4 text-base text-[#d4af37]/60 font-bold select-none">♣</span>
        <span className="absolute bottom-3 right-4 text-base text-red-600/70 font-bold select-none">♦</span>

        {/* Halo ambiental rojo carmesí y oro antiguo */}
        <div className="absolute -top-24 left-1/4 w-96 h-48 bg-red-950/25 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-96 h-48 bg-amber-900/20 blur-[100px] pointer-events-none" />

        {/* Cabecera Art Decó: Categoría, Gramófono y Estado de Audio */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 z-20 relative">
          <div className="bg-black/90 backdrop-blur-md border border-[#d4af37]/50 px-4 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-broadway font-bold text-amber-300 shadow-md">
            <span className="text-red-500">♠</span>
            <span className="text-gold-emboss">EL GRAMÓFONO CLANDESTINO</span>
            <span className="text-[#d4af37]/40">•</span>
            <span className="text-amber-100/80 font-vintage text-[11px]">DISCOS 78 RPM</span>
          </div>

          <div className="flex items-center gap-2">
            {musicPlaying && !buzzerLocked ? (
              <div className="bg-red-950/60 border border-[#d4af37]/60 px-4 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-broadway font-bold text-amber-300 shadow-deco-gold animate-pulse">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>SONANDO EN DIRECTO (30s)</span>
              </div>
            ) : (
              <div className="bg-black/80 border border-[#d4af37]/30 px-4 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-vintage font-bold text-amber-200/60 shadow-md">
                <VolumeX className="w-4 h-4 text-amber-400/50" />
                <span>AGUJA EN PAUSA</span>
              </div>
            )}
          </div>
        </div>

        {/* ESCENARIO INTEGRADO: DISCO A LA IZQUIERDA Y ESTADO DINÁMICO A LA DERECHA */}
        <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 py-5 px-4 bg-black/75 border-2 border-[#d4af37]/40 rounded-3xl shadow-inner backdrop-blur-md min-h-[300px]">
          {/* DISCO DE GRAMÓFONO 78 RPM (SHELLAC VINTAGE GIRATORIO) */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#d4af37]/10 blur-xl pointer-events-none" />

            <motion.div
              animate={{
                rotate: musicPlaying && !buzzerLocked ? 360 : 0,
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: 'linear',
              }}
              className="w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-[#050508] via-[#121218] to-[#08080c] border-4 border-[#d4af37]/70 shadow-[0_0_35px_rgba(212,175,55,0.25)] relative flex items-center justify-center"
            >
              {/* Surcos concéntricos de audio */}
              <div className="absolute inset-2 rounded-full border border-[#d4af37]/20" />
              <div className="absolute inset-5 rounded-full border border-amber-200/15" />
              <div className="absolute inset-8 rounded-full border border-[#d4af37]/25" />
              <div className="absolute inset-12 rounded-full border border-amber-200/10" />
              <div className="absolute inset-16 rounded-full border border-[#d4af37]/25" />

              {/* Sello central Art Decó */}
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#d4af37] via-[#9e7d23] to-[#5c4410] border-2 border-[#fff3b0] flex flex-col items-center justify-center shadow-lg relative overflow-hidden text-center p-1">
                {musicRevealed && (currentSong.coverUrl || currentSong.albumArt) ? (
                  <img
                    src={currentSong.coverUrl || currentSong.albumArt}
                    alt={currentSong.title}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <>
                    <span className="text-[6px] font-broadway uppercase tracking-widest text-slate-950 font-black">
                      HIS MASTER'S VOICE
                    </span>
                    <span className="text-sm select-none my-0.5">🎶</span>
                    <span className="text-[5px] font-vintage uppercase text-slate-900 font-bold">
                      78 R.P.M.
                    </span>
                  </>
                )}
                <div className="absolute w-3 h-3 rounded-full bg-[#07070a] border border-[#fff3b0]/80 shadow-inner" />
              </div>
            </motion.div>
          </div>

          {/* COLUMNA DERECHA: PISTA / GANADOR DEL TIMBRE / SOLUCIÓN REVELADA */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left max-w-md z-10 w-full">
            <AnimatePresence mode="wait">
              {/* CASO 1: ALGUIEN HA PULSADO EL TIMBRE Y LA CANCIÓN AÚN NO ESTÁ REVELADA */}
              {buzzerLocked && buzzerWinner && !musicRevealed ? (
                <motion.div
                  key="buzzer-winner-state"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full p-4 sm:p-5 rounded-2xl bg-black/90 border-2 shadow-deco-gold flex flex-col items-center md:items-start gap-3"
                  style={{ borderColor: buzzerWinner.teamColorHex || '#d4af37' }}
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/60 text-amber-300 text-[11px] font-broadway uppercase tracking-wider">
                    <span>⚡</span> ¡HA PULSADO PRIMERO!
                  </div>

                  <div className="flex items-center gap-3.5 w-full">
                    {/* AVATAR ESTRICTAMENTE ACOTADO */}
                    <div className="relative shrink-0">
                      <div
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-black border-2 shadow-lg flex items-center justify-center p-1"
                        style={{ borderColor: buzzerWinner.teamColorHex || '#d4af37' }}
                      >
                        <img
                          src={generateAvatarDataUri(winnerSeed, winnerStyle)}
                          alt={buzzerWinner.playerName}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      {winnerEmoji && (
                        <div className="absolute -top-1.5 -right-1.5 text-xs bg-black/90 rounded-full px-1.5 py-0.5 border border-[#d4af37]/60 shadow">
                          <TwemojiText>{winnerEmoji}</TwemojiText>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 text-left flex-1">
                      <h4 className="text-2xl sm:text-3xl font-broadway uppercase text-gold-emboss truncate">
                        {buzzerWinner.playerName}
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <span
                          className="text-base sm:text-lg font-broadway uppercase"
                          style={{ color: buzzerWinner.teamColorHex }}
                        >
                          {buzzerWinner.teamName}
                        </span>
                        {isWinnerCaptain && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-400 text-amber-300 text-xs font-black">
                            <Crown className="w-3 h-3 fill-amber-400 text-amber-400" /> CAPITÁN
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-full pt-2.5 border-t border-[#d4af37]/30 flex items-center justify-center md:justify-start gap-2 text-xs font-vintage font-bold text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>Esperando veredicto del Anfitrión en su consola...</span>
                  </div>
                </motion.div>
              ) : !musicRevealed ? (
                /* CASO 2: BUSCANDO / REPRODUCIENDO SIN QUE NADIE HAYA PULSADO */
                <motion.div
                  key="hidden-music-state"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full"
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/90 text-amber-300 text-[11px] font-broadway uppercase tracking-wider mb-2 border border-[#d4af37]/45 shadow-sm">
                    <Sparkles className="w-3 h-3 text-[#d4af37]" />
                    <span>PISTA EN EL SALÓN DE JUEGO</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-broadway uppercase text-gold-emboss tracking-wide leading-tight">
                    ¿QUÉ CANCIÓN SUENA?
                  </h3>

                  <p className="text-amber-100/75 text-xs sm:text-sm font-vintage mt-1.5 leading-relaxed">
                    ¡El primer equipo en presionar el timbre de bronce responderá con el <strong className="text-[#d4af37]">Título</strong>, <strong className="text-[#d4af37]">Cantante</strong> o <strong className="text-[#d4af37]">Ambos</strong>!
                  </p>

                  {/* ECUALIZADOR DINÁMICO */}
                  <div className="flex items-end justify-center md:justify-start gap-1.5 h-10 mt-4">
                    {[35, 65, 25, 90, 45, 100, 30, 80, 50, 95, 40, 70].map((height, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height:
                            musicPlaying && !buzzerLocked
                              ? [`${(height % 30) + 15}%`, `${height}%`, `${(height % 40) + 20}%`]
                              : '12%',
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.35 + (i % 4) * 0.1,
                          ease: 'easeInOut',
                        }}
                        className="w-2.5 rounded-t-sm bg-gradient-to-t from-[#5c4410] via-[#d4af37] to-[#fff3b0] shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                      />
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#d4af37]/20 flex items-center justify-center md:justify-start gap-2 text-[11px] font-vintage text-amber-200/60">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>Acierto: suma puntos al marcador de la ronda</span>
                  </div>
                </motion.div>
              ) : (
                /* CASO 3: CANCIÓN REVELADA TRAS RESOLVERLA */
                <motion.div
                  key="revealed-music-state"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full flex flex-col sm:flex-row items-center gap-4 bg-black/90 border-2 border-[#d4af37] p-4 rounded-2xl shadow-deco-gold deco-card-frame"
                >
                  {(currentSong.coverUrl || currentSong.albumArt) && (
                    <div className="relative shrink-0">
                      <img
                        src={currentSong.coverUrl || currentSong.albumArt}
                        alt={currentSong.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shadow-2xl border-2 border-[#d4af37]"
                      />
                      <div className="absolute -top-1.5 -left-1.5 text-xs text-[#d4af37] select-none">♠</div>
                      <div className="absolute -bottom-1.5 -right-1.5 text-xs text-red-600 select-none">♥</div>
                    </div>
                  )}
                  <div className="min-w-0 text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#d4af37]/15 text-amber-300 text-[10px] font-broadway uppercase tracking-wider mb-1.5 border border-[#d4af37]/40">
                      🎉 ¡MELODÍA RESUELTA!
                    </div>
                    <h4 className="text-xl sm:text-2xl font-broadway uppercase text-gold-emboss leading-tight truncate">
                      {currentSong.title}
                    </h4>
                    <p className="text-base sm:text-lg font-vintage font-bold text-amber-200 mt-0.5">
                      {currentSong.artist}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-amber-300/80 font-vintage flex-wrap">
                      {currentSong.year ? (
                        <span className="bg-black/90 border border-[#d4af37]/40 px-2 py-0.5 rounded-md font-broadway text-amber-200">
                          Año {currentSong.year}
                        </span>
                      ) : null}
                      <span className="bg-red-950/60 border border-red-800/60 text-red-200 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">
                        Sello Oficial
                      </span>
                      {buzzerWinner && (
                        <span className="text-[11px] text-amber-300 font-bold">
                          • Pulsado por: {buzzerWinner.playerName} ({buzzerWinner.teamName})
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
