import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clapperboard } from 'lucide-react';
import { MovieItem } from '../../../lib/moviesData';

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
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* ESCENARIO DE ADIVINANZA CON EMOJIS (MARCO TEATRAL SILENT FILM) */}
      <div className="relative w-full rounded-3xl overflow-hidden border-4 border-[#d4af37]/60 shadow-deco-gold bg-gradient-to-b from-[#0c0c14] via-[#090910] to-black p-6 md:p-10 text-center hell-card-frame">
        {/* Viñeta e iluminación decorativa */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/15 blur-[90px] pointer-events-none" />

        {/* Cabecera del misterio: Género, Año y Nivel de Pista */}
        <div className="flex items-center justify-between mb-8 z-20 relative">
          <div className="bg-[#0c0c14]/90 backdrop-blur-md border border-[#d4af37]/50 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-vintage font-bold text-amber-300 shadow-lg">
            <Clapperboard className="w-4 h-4 text-amber-400" />
            <span>{currentMovie.genreEmoji} {currentMovie.category}</span>
            <span className="text-[#d4af37]/40">•</span>
            <span className="text-white font-broadway">Año {currentMovie.year}</span>
          </div>

          <div className="bg-[#0c0c14]/90 backdrop-blur-md border border-[#d4af37]/40 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-vintage font-bold text-amber-200 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-vintage">
              {movieFrameLevel === 1 && '🎯 Pista 1: 2 Emojis (+3 pts)'}
              {movieFrameLevel === 2 && '🔍 Pista 2: 4 Emojis (+2 pts)'}
              {movieFrameLevel === 3 && '⭐ Pista 3: Todos los Emojis (+1 pt)'}
              {movieFrameLevel >= 4 && '💡 Pista 4: + Pista de Texto (+1 pt)'}
            </span>
          </div>
        </div>

        {/* CONTENEDOR CENTRAL DE EMOJIS GIGANTES */}
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 py-8 px-4 my-2 bg-black/60 border-2 border-[#d4af37]/30 rounded-3xl shadow-inner backdrop-blur-md min-h-[160px]">
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

        {/* PISTA ADICIONAL DE TEXTO (SI SE ACTIVA NIVEL 4) */}
        {movieFrameLevel >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 bg-amber-500/10 border border-[#d4af37]/40 rounded-2xl px-5 py-3 text-amber-200 text-xs md:text-sm font-vintage max-w-2xl mx-auto shadow-md"
          >
            <span className="font-broadway uppercase tracking-wider text-gold-gradient mr-2">Pista Secreta:</span>
            "{currentMovie.textHint}"
          </motion.div>
        )}

        {/* OVERLAY: REVELADO FINAL DEL TÍTULO DE LA PELÍCULA CON EXPLICACIÓN */}
        <AnimatePresence>
          {movieRevealed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#07070a]/95 backdrop-blur-xl z-30 flex flex-col items-center justify-center p-6 text-center hell-card-frame-crimson"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-gradient text-slate-950 text-xs font-broadway font-black uppercase tracking-widest mb-3 border border-[#f5eedb]/50 shadow-deco-gold">
                🎉 ¡PELÍCULA RESUELTA!
              </div>
              <h2 className="text-4xl md:text-6xl font-broadway uppercase text-gold-gradient drop-shadow-[0_0_35px_rgba(212,175,55,0.6)]">
                {currentMovie.title}
              </h2>
              {currentMovie.originalTitle && currentMovie.originalTitle !== currentMovie.title && (
                <p className="text-base text-amber-200/70 mt-1 italic font-editorial">
                  "{currentMovie.originalTitle}"
                </p>
              )}

              <div className="flex items-center gap-3 mt-4 text-xs md:text-sm text-amber-100 font-vintage">
                <span className="bg-[#14141e] px-3 py-1 rounded-xl border border-[#d4af37]/30 font-bold">
                  Año {currentMovie.year}
                </span>
                {currentMovie.director && (
                  <span className="bg-[#14141e] px-3 py-1 rounded-xl border border-[#d4af37]/30 font-medium">
                    Dir: <strong className="text-white font-broadway">{currentMovie.director}</strong>
                  </span>
                )}
                <span className="bg-gold-gradient text-slate-950 px-3 py-1 rounded-xl border border-[#f5eedb]/30 font-broadway font-black">
                  {currentMovie.category}
                </span>
              </div>

              {/* Explicación de los emojis */}
              <div className="mt-6 bg-[#0c0c14]/90 border border-[#d4af37]/40 px-5 py-3 rounded-2xl max-w-xl text-xs md:text-sm text-amber-100/90 text-left font-vintage">
                <span className="text-[10px] uppercase font-broadway text-gold-gradient block mb-1">
                  Descifrado del Acertijo:
                </span>
                {currentMovie.explanation}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
