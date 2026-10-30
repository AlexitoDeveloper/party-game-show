import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clapperboard } from 'lucide-react';
import { MovieItem, getTitleWordMasks } from '../../../lib/moviesData';

export interface TvMoviesGameProps {
  currentMovie: MovieItem;
  movieFrameLevel: 1 | 2 | 3 | 4 | number;
  movieRevealed: boolean;
}

export const TvMoviesGame: React.FC<TvMoviesGameProps> = ({
  currentMovie,
  movieFrameLevel,
  movieRevealed,
}) => {
  const showInitials = movieFrameLevel >= 3;
  const wordMasks = getTitleWordMasks(currentMovie.title, showInitials);
  const cleanTitle = currentMovie.title.replace(/^\[DEMO\]\s*/i, '').trim();
  const totalLetters = (cleanTitle.match(/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9]/g) || []).length;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* ESCENARIO DE ADIVINANZA CON EMOJIS (MARCO TEATRAL SILENT FILM) */}
      <div className="relative w-full rounded-3xl overflow-hidden border-4 border-[#d4af37]/60 shadow-deco-gold bg-gradient-to-b from-[#0c0c14] via-[#090910] to-black p-6 md:p-8 text-center hell-card-frame">
        {/* Viñeta e iluminación decorativa */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/15 blur-[90px] pointer-events-none" />

        {/* Cabecera del misterio: Categoría, Año y Nivel de Pista */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 z-20 relative">
          <div className="bg-[#0c0c14]/90 backdrop-blur-md border border-[#d4af37]/60 px-5 py-2.5 rounded-2xl flex items-center gap-2.5 text-sm sm:text-base font-vintage font-bold text-amber-300 shadow-lg">
            <Clapperboard className="w-5 h-5 text-amber-400" />
            <span>{currentMovie.category}</span>
            <span className="text-[#d4af37]/50">•</span>
            <span className="text-white font-broadway">Año {currentMovie.year}</span>
          </div>

          <div className="bg-[#0c0c14]/90 backdrop-blur-md border border-[#d4af37]/50 px-5 py-2.5 rounded-2xl flex items-center gap-2.5 text-sm sm:text-base font-vintage font-bold text-amber-200 shadow-lg">
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
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 py-6 px-4 my-2 bg-black/60 border-2 border-[#d4af37]/30 rounded-3xl shadow-inner backdrop-blur-md min-h-[140px]">
          {(movieFrameLevel === 1
            ? currentMovie.emojisStage1
            : movieFrameLevel === 2
            ? currentMovie.emojisStage2
            : currentMovie.emojisFull
          ).map((em, idx) => (
            <motion.span
              key={`${currentMovie.id}_${movieFrameLevel}_${idx}_${em}`}
              initial={{ scale: 0, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: idx * 0.08, type: 'spring', stiffness: 280 }}
              className="text-6xl sm:text-7xl md:text-8xl select-none filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] hover:scale-110 transition-transform"
            >
              {em}
            </motion.span>
          ))}
        </div>

        {/* NIVEL 2 Y 3: HUECOS DEL TÍTULO (ESTILO AHORCADO) + INICIALES EN NIVEL 3 */}
        {(movieFrameLevel === 2 || movieFrameLevel === 3) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-[#11111a]/90 border border-[#d4af37]/40 rounded-2xl px-5 py-4 max-w-3xl mx-auto shadow-lg"
          >
            <div className="text-xs sm:text-sm font-broadway uppercase tracking-widest text-amber-300/90 mb-2.5 flex items-center justify-center gap-2">
              <span>{showInitials ? '🔤 Iniciales del Título Reveladas' : '🧩 Estructura del Título'}</span>
              <span className="text-amber-200/60 font-mono text-xs">
                ({wordMasks.length} {wordMasks.length === 1 ? 'palabra' : 'palabras'} • {totalLetters} letras)
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {wordMasks.map((mask, wIdx) => (
                <span
                  key={wIdx}
                  className="px-3.5 py-2 rounded-xl bg-black/80 border border-[#d4af37]/50 font-mono font-black text-xl sm:text-2xl md:text-3xl tracking-wider text-gold-gradient shadow-inner"
                >
                  {mask}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* NIVEL 3: PISTA DE TEXTO DIRECTA */}
        {movieFrameLevel >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-amber-500/10 border-2 border-[#d4af37]/50 rounded-2xl px-6 py-3.5 text-amber-100 text-base md:text-lg font-vintage max-w-3xl mx-auto shadow-lg"
          >
            <span className="font-broadway uppercase tracking-wider text-gold-gradient text-base md:text-lg mr-2">
              💡 Pista:
            </span>
            "{currentMovie.textHint}"
          </motion.div>
        )}

        {/* NIVEL 4: MODO SALVAVIDAS CON 4 OPCIONES TIPO TEST (A, B, C, D) */}
        {movieFrameLevel >= 4 && currentMovie.options && currentMovie.options.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4 max-w-3xl mx-auto"
          >
            {currentMovie.options.map((opt, oIdx) => {
              const letters = ['A', 'B', 'C', 'D'];
              return (
                <div
                  key={oIdx}
                  className="p-3.5 sm:p-4 rounded-2xl border-2 bg-[#14141e]/95 border-[#d4af37]/45 text-amber-100 flex items-center gap-3.5 text-left shadow-md"
                >
                  <span className="w-10 h-10 rounded-xl bg-gold-gradient text-slate-950 flex items-center justify-center font-broadway font-black text-base sm:text-lg shrink-0 shadow-sm">
                    {letters[oIdx]}
                  </span>
                  <span className="font-broadway text-base sm:text-lg md:text-xl leading-snug text-amber-50">
                    {opt.replace(/^\[DEMO\]\s*/i, '')}
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* OVERLAY: REVELADO FINAL DEL TÍTULO DE LA PELÍCULA */}
        <AnimatePresence>
          {movieRevealed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#07070a]/95 backdrop-blur-xl z-30 flex flex-col items-center justify-center p-8 text-center hell-card-frame-crimson"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold-gradient text-slate-950 text-sm sm:text-base font-broadway font-black uppercase tracking-widest mb-3 border border-[#f5eedb]/60 shadow-deco-gold">
                🎉 ¡ENIGMA RESUELTO!
              </div>
              <h2 className="text-4xl md:text-6xl font-broadway uppercase text-gold-gradient drop-shadow-[0_0_35px_rgba(212,175,55,0.6)]">
                {currentMovie.title}
              </h2>
              {currentMovie.originalTitle && currentMovie.originalTitle !== currentMovie.title && (
                <p className="text-xl text-amber-200/80 mt-1 italic font-editorial">
                  "{currentMovie.originalTitle}"
                </p>
              )}

              <div className="flex items-center gap-3 mt-5 text-sm md:text-base text-amber-100 font-vintage flex-wrap justify-center">
                <span className="bg-[#14141e] px-4 py-1.5 rounded-xl border border-[#d4af37]/40 font-bold">
                  Año {currentMovie.year}
                </span>
                {currentMovie.director && (
                  <span className="bg-[#14141e] px-4 py-1.5 rounded-xl border border-[#d4af37]/40 font-medium">
                    Dir: <strong className="text-white font-broadway">{currentMovie.director}</strong>
                  </span>
                )}
                <span className="bg-gold-gradient text-slate-950 px-4 py-1.5 rounded-xl border border-[#f5eedb]/40 font-broadway font-black">
                  {currentMovie.category}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
