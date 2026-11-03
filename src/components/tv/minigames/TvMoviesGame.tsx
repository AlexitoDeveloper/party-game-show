import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clapperboard } from 'lucide-react';
import { MovieItem, getTitleWordMasks } from '../../../lib/moviesData';
import { BuzzerPressPayload } from '../../../lib/types';
import { DiceBearStyle, generateAvatarDataUri } from '../../../lib/dicebear';
import { TwemojiText } from '../../TwemojiText';

export interface TvMoviesGameProps {
  currentMovie: MovieItem;
  movieFrameLevel: 1 | 2 | 3 | 4 | number;
  movieRevealed: boolean;
  buzzerLocked?: boolean;
  buzzerWinner?: BuzzerPressPayload | null;
}

export const TvMoviesGame: React.FC<TvMoviesGameProps> = ({
  currentMovie,
  movieFrameLevel,
  movieRevealed,
  buzzerLocked = false,
  buzzerWinner = null,
}) => {
  const showInitials = movieFrameLevel >= 3;
  const wordMasks = getTitleWordMasks(currentMovie.title, showInitials);
  const cleanTitle = currentMovie.title.replace(/^\[DEMO\]\s*/i, '').trim();
  const totalLetters = (cleanTitle.match(/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9]/g) || []).length;

  const winnerSeed = buzzerWinner?.avatarSeed || buzzerWinner?.playerName || 'player';
  const winnerStyle = (buzzerWinner?.avatarStyle || 'avataaars') as DiceBearStyle;
  const winnerEmoji = buzzerWinner?.badgeEmoji;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* ESCENARIO DE ADIVINANZA CON EMOJIS (MARCO TEATRAL SILENT FILM) */}
      <div className="relative w-full rounded-3xl overflow-hidden border-2 border-[#d4af37]/60 shadow-deco-gold bg-[#0c0c14]/95 p-6 sm:p-8 text-center backdrop-blur-xl hell-card-frame">
        {/* Viñeta e iluminación decorativa */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/15 blur-[90px] pointer-events-none" />

        {/* Cabecera del misterio: Categoría, Año y Nivel de Pista */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5 z-20 relative">
          <div className="bg-[#07070a]/90 backdrop-blur-md border border-[#d4af37]/60 px-5 py-2.5 rounded-2xl flex items-center gap-2.5 text-sm sm:text-base font-vintage font-bold text-amber-300 shadow-lg">
            <Clapperboard className="w-5 h-5 text-amber-400" />
            <span>{currentMovie.category}</span>
            <span className="text-[#d4af37]/50">•</span>
            <span className="text-white font-broadway">Año {currentMovie.year}</span>
          </div>

          <div className="bg-[#07070a]/90 backdrop-blur-md border border-[#d4af37]/50 px-5 py-2.5 rounded-2xl flex items-center gap-2.5 text-sm sm:text-base font-vintage font-bold text-amber-200 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-vintage">
              {movieFrameLevel === 1 && '🎯 Pista 1: 3 Emojis de Trama (+3 pts)'}
              {movieFrameLevel === 2 && '🔍 Pista 2: 5 Emojis + Huecos del Título (+2 pts)'}
              {movieFrameLevel === 3 && '⭐ Pista 3: Iniciales + Pista de Texto (+1 pt)'}
              {movieFrameLevel >= 4 && '🆘 Pista 4: ¡Modo Salvavidas! 4 Opciones (+1 pt)'}
            </span>
          </div>
        </div>

        {/* CONTENEDOR CENTRAL DE EMOJIS GIGANTES */}
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 py-5 px-4 my-2 bg-[#07070a]/90 border border-[#d4af37]/40 rounded-2xl shadow-inner min-h-[120px]">
          {(movieFrameLevel === 1
            ? currentMovie.emojisStage1
            : movieFrameLevel === 2
            ? currentMovie.emojisStage2
            : currentMovie.emojisFull
          ).map((em, idx) => (
            <motion.span
              key={`${currentMovie.id}_${movieFrameLevel}_${idx}_${em}`}
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: idx * 0.06, type: 'spring', stiffness: 280 }}
              className="text-5xl sm:text-6xl md:text-7xl select-none filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
            >
              {em}
            </motion.span>
          ))}
        </div>

        {/* NIVEL 2 Y 3: HUECOS DEL TÍTULO (OCULTOS AL REVELAR PARA MANTENER DISEÑO COMPACTO) */}
        {!movieRevealed && (movieFrameLevel === 2 || movieFrameLevel === 3) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-[#11111a]/90 border border-[#d4af37]/40 rounded-2xl px-5 py-3.5 max-w-3xl mx-auto shadow-lg"
          >
            <div className="text-xs sm:text-sm font-broadway uppercase tracking-widest text-amber-300/90 mb-2 flex items-center justify-center gap-2">
              <span>{showInitials ? '🔤 Iniciales del Título Reveladas' : '🧩 Estructura del Título'}</span>
              <span className="text-amber-200/60 font-mono text-xs">
                ({wordMasks.length} {wordMasks.length === 1 ? 'palabra' : 'palabras'} • {totalLetters} letras)
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
              {wordMasks.map((mask, wIdx) => (
                <span
                  key={wIdx}
                  className="px-3 py-1.5 rounded-xl bg-black/80 border border-[#d4af37]/50 font-mono font-black text-lg sm:text-xl md:text-2xl tracking-wider text-gold-gradient shadow-inner"
                >
                  {mask}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* NIVEL 3: PISTA DE TEXTO DIRECTA (OCULTA EN NIVEL 4 O AL REVELAR) */}
        {!movieRevealed && movieFrameLevel === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-amber-500/10 border border-[#d4af37]/50 rounded-2xl px-5 py-3 text-amber-100 text-sm md:text-base font-vintage max-w-3xl mx-auto shadow-md"
          >
            <span className="font-broadway uppercase tracking-wider text-gold-gradient mr-2">
              💡 Pista:
            </span>
            "{currentMovie.textHint}"
          </motion.div>
        )}

        {/* NIVEL 4: MODO SALVAVIDAS CON 4 OPCIONES TIPO TEST (A, B, C, D) */}
        {movieFrameLevel >= 4 && currentMovie.options && currentMovie.options.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
            {currentMovie.options.map((opt, oIdx) => {
              const letters = ['A', 'B', 'C', 'D'];
              const cleanOpt = opt.replace(/^\[DEMO\]\s*/i, '').trim();
              const isCorrectOpt =
                movieRevealed &&
                (cleanTitle.toLowerCase().includes(cleanOpt.toLowerCase()) ||
                  cleanOpt.toLowerCase().includes(cleanTitle.toLowerCase()));
              return (
                <div
                  key={oIdx}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 flex items-center gap-3.5 text-left transition-all ${
                    isCorrectOpt
                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-100 shadow-[0_0_25px_rgba(52,211,153,0.35)] scale-[1.02]'
                      : 'bg-[#14141e]/90 border-[#d4af37]/35 text-amber-100/90'
                  }`}
                >
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-broadway font-black text-base sm:text-lg shrink-0 shadow-sm ${
                      isCorrectOpt ? 'bg-emerald-400 text-slate-950' : 'bg-gold-gradient text-slate-950'
                    }`}
                  >
                    {letters[oIdx]}
                  </span>
                  <span className="font-vintage font-bold text-base sm:text-lg md:text-xl leading-snug">
                    {cleanOpt}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* REVELACIÓN SUTIL DE LA SOLUCIÓN (MISMO ESTILO QUE TRIVIAL) */}
        {movieRevealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#07070a] to-emerald-950/90 border-2 border-emerald-400/80 text-center shadow-2xl"
          >
            <span className="text-xs sm:text-sm uppercase font-broadway font-black tracking-widest text-emerald-300 block mb-0.5">
              🎉 PELÍCULA / SERIE CORRECTA
            </span>
            <div className="text-2xl sm:text-4xl font-broadway text-emerald-200 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">
              {cleanTitle}
              {currentMovie.year ? (
                <span className="text-base sm:text-xl text-emerald-300/80 font-vintage ml-2">
                  ({currentMovie.year})
                </span>
              ) : null}
            </div>
            {currentMovie.explanation && (
              <p className="text-xs sm:text-sm text-amber-200/85 font-vintage mt-1 italic">
                💡 {currentMovie.explanation}
              </p>
            )}
            {buzzerWinner && (
              <div className="mt-2 text-xs text-amber-300/80 font-vintage">
                Pulsado por: <strong className="text-white">{buzzerWinner.playerName}</strong> ({buzzerWinner.teamName})
              </div>
            )}
          </motion.div>
        )}

        {/* Turno activo de respuesta cuando alguien pulsa el timbre */}
        <AnimatePresence mode="wait">
          {buzzerLocked && buzzerWinner && !movieRevealed && (
            <motion.div
              key="buzzer-active-movie"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3.5 sm:p-4 rounded-2xl border-2 bg-[#07070a]/95 backdrop-blur-md flex items-center justify-between shadow-xl"
              style={{
                borderColor: buzzerWinner.teamColorHex || '#d4af37',
                boxShadow: `0 0 25px ${buzzerWinner.teamColorHex || '#d4af37'}40`,
              }}
            >
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-black border-2 shadow-md flex items-center justify-center p-0.5"
                    style={{ borderColor: buzzerWinner.teamColorHex || '#d4af37' }}
                  >
                    <img
                      src={generateAvatarDataUri(winnerSeed, winnerStyle)}
                      alt={buzzerWinner.playerName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {winnerEmoji ? (
                    <div className="absolute -top-1.5 -right-1.5 text-xs bg-black/90 rounded-full px-1 py-0.5 border border-[#d4af37]/60 shadow">
                      <TwemojiText>{winnerEmoji}</TwemojiText>
                    </div>
                  ) : null}
                </div>

                <div className="text-left">
                  <span className="text-xs uppercase font-broadway tracking-wider text-amber-300 block">
                    ⚡ ¡Pulsó primero: {buzzerWinner.playerName}!
                  </span>
                  <div
                    className="text-xl sm:text-2xl font-broadway"
                    style={{ color: buzzerWinner.teamColorHex || '#f5eedb' }}
                  >
                    {buzzerWinner.teamName}
                  </div>
                </div>
              </div>

              <div className="text-xs sm:text-sm font-vintage font-bold text-amber-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span>Respondiendo...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

