import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Disc, Volume2, VolumeX, Music, Crown } from 'lucide-react';
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
  if (!currentSong) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <div className="w-full bg-slate-900/90 border-2 border-slate-700/80 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Music className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-wider">
            ESPERANDO SELECCIÓN MUSICAL
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
            El Anfitrión está eligiendo un temazo de Spotify desde su panel de control... ¡Afilad vuestros oídos!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <div className="w-full bg-slate-900/90 border-2 border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Glows ambientales */}
        <div className="absolute -top-24 left-1/4 w-96 h-48 bg-pink-500/20 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-96 h-48 bg-cyan-500/20 blur-[100px] pointer-events-none" />

        {/* Cabecera: Categoría, Ronda y Estado de Audio */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 z-20 relative">
          <div className="bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-black text-emerald-300 shadow-lg">
            <Disc className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span>ADIVINA EL TEMAZO</span>
            <span className="text-slate-500">•</span>
            <span className="text-white/90 font-bold">Spotify</span>
          </div>

          <div className="flex items-center gap-2">
            {musicPlaying && !buzzerLocked ? (
              <div className="bg-emerald-500/20 border border-emerald-500/40 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-300 shadow-lg">
                <Volume2 className="w-4 h-4 animate-pulse text-emerald-400" />
                <span>SONANDO PREVIEW (30s)</span>
              </div>
            ) : (
              <div className="bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold text-slate-300 shadow-lg">
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span>EN PAUSA</span>
              </div>
            )}
          </div>
        </div>

        {/* ESCENARIO DEL DISCO DE VINILO Y CARÁTULA MISTERIOSA */}
        <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 py-6 px-4 my-2 bg-slate-950/70 border-2 border-slate-800/80 rounded-3xl shadow-inner backdrop-blur-md min-h-[320px]">
          {/* DISCO DE VINILO 3D GIRATORIO */}
          <div className="relative shrink-0">
            <motion.div
              animate={{
                rotate: musicPlaying && !buzzerLocked ? 360 : 0,
              }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: 'linear',
              }}
              className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-[#0a0a0c] via-[#1a1a20] to-[#0d0d10] border-4 border-[#d4af37]/60 shadow-[0_0_35px_rgba(212,175,55,0.25)] relative flex items-center justify-center"
            >
              <div className="absolute inset-2 rounded-full border border-[#d4af37]/20" />
              <div className="absolute inset-5 rounded-full border border-[#d4af37]/35" />
              <div className="absolute inset-9 rounded-full border border-[#d4af37]/20" />
              <div className="absolute inset-14 rounded-full border border-[#d4af37]/30" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-amber-200/5 to-transparent pointer-events-none" />

              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#d4af37] via-[#b38f2a] to-[#8a6a1a] border-2 border-[#f5eedb] flex items-center justify-center shadow-lg relative overflow-hidden">
                {musicRevealed && (currentSong.coverUrl || currentSong.albumArt) ? (
                  <img
                    src={currentSong.coverUrl || currentSong.albumArt}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music className="w-7 h-7 text-slate-950 drop-shadow" />
                )}
                <div className="absolute w-4 h-4 rounded-full bg-[#0a0a0e] border border-[#f5eedb]/40" />
              </div>
            </motion.div>
          </div>

          {/* CARÁTULA MISTERIOSA O REVELADA */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left max-w-md">
            <AnimatePresence mode="wait">
              {!musicRevealed ? (
                <motion.div
                  key="hidden-music"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-gradient text-slate-950 text-xs font-vintage font-bold uppercase tracking-wider mb-2 border border-[#f5eedb]/40 shadow-sm">
                    🎧 GRAMÓFONO EN VIVO
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-broadway uppercase text-gold-gradient tracking-wide">
                    ¿QUÉ CANCIÓN ES?
                  </h3>
                  <p className="text-amber-100/70 text-xs sm:text-sm font-vintage mt-1">
                    ¡El primer concursante en presionar el pulsador responderá con el Título, Artista o Ambos!
                  </p>

                  {/* BARRAS DE ECUALIZADOR DINÁMICAS */}
                  <div className="flex items-end justify-center md:justify-start gap-1.5 h-12 mt-5">
                    {[35, 60, 20, 85, 45, 95, 30, 75, 50, 90, 40, 65].map((height, i) => (
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
                          duration: 0.4 + (i % 4) * 0.1,
                          ease: 'easeInOut',
                        }}
                        className="w-2 sm:w-2.5 rounded-full bg-gradient-to-t from-[#8a6a1a] via-[#d4af37] to-[#f5eedb] shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="revealed-music"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full flex flex-col sm:flex-row items-center gap-4 bg-slate-900/90 border border-pink-500/40 p-4 rounded-2xl shadow-[0_0_30px_rgba(236,72,153,0.3)]"
                >
                  {(currentSong.coverUrl || currentSong.albumArt) && (
                    <img
                      src={currentSong.coverUrl || currentSong.albumArt}
                      alt={currentSong.title}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shadow-2xl border-2 border-pink-400 shrink-0"
                    />
                  )}
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-black uppercase tracking-wider mb-1 border border-pink-500/40">
                      🎉 ¡CANCIÓN REVELADA!
                    </div>
                    <h4 className="text-xl sm:text-2xl font-black text-white drop-shadow leading-tight">
                      {currentSong.title}
                    </h4>
                    <p className="text-base sm:text-lg font-bold text-amber-300 mt-0.5">
                      {currentSong.artist}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      {currentSong.year ? (
                        <span className="bg-slate-800 px-2 py-0.5 rounded-md font-mono text-slate-300">
                          Año {currentSong.year}
                        </span>
                      ) : null}
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        🟢 Spotify Track
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* OVERLAY DEL BUZZER CUANDO ALGUIEN PULSA EN MODO MÚSICA */}
        <AnimatePresence>
          {buzzerLocked && buzzerWinner && (() => {
            const winnerPlayer = players.find((p) => p.id === buzzerWinner.playerId || p.nickname === buzzerWinner.playerName);
            const winnerSeed = buzzerWinner.avatarSeed || winnerPlayer?.avatar_seed || buzzerWinner.playerName;
            const winnerStyle = (buzzerWinner.avatarStyle || winnerPlayer?.avatar_style || 'avataaars') as DiceBearStyle;
            const winnerEmoji = buzzerWinner.badgeEmoji || winnerPlayer?.badge_emoji;

            return (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="mt-4 w-full bg-slate-900/95 border-2 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3"
                style={{ borderColor: buzzerWinner.teamColorHex }}
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="relative shrink-0">
                    <div
                      className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border-2 shadow-md flex items-center justify-center"
                      style={{ borderColor: buzzerWinner.teamColorHex }}
                    >
                      <img
                        src={generateAvatarDataUri(winnerSeed, winnerStyle)}
                        alt={buzzerWinner.playerName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {winnerEmoji && (
                      <div className="absolute -top-1.5 -right-1.5 text-xs bg-black/80 rounded-full px-1 py-0.2 border border-slate-700">
                        <TwemojiText>{winnerEmoji}</TwemojiText>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                      ¡HA PULSADO PRIMERO!
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-lg font-black text-white">
                        {buzzerWinner.playerName}{' '}
                        <span style={{ color: buzzerWinner.teamColorHex }}>({buzzerWinner.teamName})</span>
                      </span>
                      {isWinnerCaptain && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-400 text-amber-300 text-xs font-black">
                          <Crown className="w-3 h-3 fill-amber-400 text-amber-400" /> CAPITÁN
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs font-bold text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Esperando veredicto del Anfitrión en su mando...</span>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </div>
  );
};
