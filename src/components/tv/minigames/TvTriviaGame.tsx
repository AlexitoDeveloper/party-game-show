import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { TriviaQuestion } from '../../../lib/triviaData';
import { BuzzerPressPayload } from '../../../lib/types';
import { DiceBearStyle, generateAvatarDataUri } from '../../../lib/dicebear';
import { TwemojiText } from '../../TwemojiText';

interface TvTriviaGameProps {
  currentTriviaQuestion: TriviaQuestion;
  triviaIndex: number;
  triviaRevealed: boolean;
  triviaReboundActive: boolean;
  buzzerLocked: boolean;
  buzzerWinner: BuzzerPressPayload | null;
}

export const TvTriviaGame: React.FC<TvTriviaGameProps> = ({
  currentTriviaQuestion,
  triviaIndex,
  triviaRevealed,
  triviaReboundActive,
  buzzerLocked,
  buzzerWinner,
}) => {
  const winnerSeed = buzzerWinner?.avatarSeed || buzzerWinner?.playerName || 'player';
  const winnerStyle = (buzzerWinner?.avatarStyle || 'avataaars') as DiceBearStyle;
  const winnerEmoji = buzzerWinner?.badgeEmoji;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <div className="w-full bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-6 sm:p-8 shadow-deco-gold relative overflow-hidden backdrop-blur-xl hell-card-frame">
        {/* Glows */}
        <div className="absolute -top-24 left-1/4 w-96 h-48 bg-amber-500/15 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-96 h-48 bg-yellow-500/10 blur-[100px] pointer-events-none" />

        {/* Header: Categoría + Indicador de Rebote */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 z-20 relative">
          <div className="bg-[#07070a]/90 backdrop-blur-md border border-[#d4af37]/60 px-5 py-2.5 rounded-2xl flex items-center gap-2.5 text-sm sm:text-base font-vintage font-bold text-amber-300 shadow-lg">
            <span className="text-xl">{currentTriviaQuestion.categoryEmoji}</span>
            <span className="font-broadway uppercase tracking-wide">{currentTriviaQuestion.category}</span>
            <span className="text-[#d4af37]/50">•</span>
            <span className="text-amber-100 font-mono">Pregunta {triviaIndex + 1}</span>
          </div>

          {triviaReboundActive && !triviaRevealed && (
            <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 px-5 py-2.5 rounded-2xl flex items-center gap-2 text-sm sm:text-base font-broadway font-black uppercase tracking-wider animate-bounce shadow-deco-gold border border-[#f5eedb]/60">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>¡REBOTE ABIERTO! CUALQUIERA PUEDE PULSAR (+1 pt)</span>
            </div>
          )}
        </div>

        {/* Tarjeta de Pregunta */}
        <div className="p-6 md:p-8 rounded-2xl bg-[#07070a]/90 border border-[#d4af37]/50 text-center shadow-inner my-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-broadway text-amber-50 leading-tight drop-shadow-md">
            {currentTriviaQuestion.question}
          </h2>
        </div>

        {/* Opciones Tipo Test (si las tiene) */}
        {currentTriviaQuestion.options && currentTriviaQuestion.options.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
            {currentTriviaQuestion.options.map((opt, oIdx) => {
              const letters = ['A', 'B', 'C', 'D'];
              const isCorrectOpt = triviaRevealed && (
                currentTriviaQuestion.correctAnswer.toLowerCase().includes(opt.toLowerCase()) ||
                opt.toLowerCase().includes(currentTriviaQuestion.correctAnswer.toLowerCase())
              );
              return (
                <div
                  key={oIdx}
                  className={`p-4 sm:p-5 rounded-2xl border-2 flex items-center gap-4 text-left transition-all ${
                    isCorrectOpt
                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-100 shadow-[0_0_25px_rgba(52,211,153,0.35)] scale-105'
                      : 'bg-[#14141e]/90 border-[#d4af37]/35 text-amber-100/90 hover:border-[#d4af37]/60'
                  }`}
                >
                  <span className={`w-12 h-12 rounded-xl flex items-center justify-center font-broadway font-black text-lg sm:text-xl shrink-0 shadow-md ${
                    isCorrectOpt ? 'bg-emerald-400 text-slate-950' : 'bg-gold-gradient text-slate-950'
                  }`}>
                    {letters[oIdx]}
                  </span>
                  <span className="font-vintage font-bold text-lg sm:text-xl md:text-2xl leading-snug">{opt}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Revelación sutil y compacta de Solución */}
        {triviaRevealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#07070a] to-emerald-950/90 border-2 border-emerald-400/80 text-center shadow-2xl"
          >
            <span className="text-xs sm:text-sm uppercase font-broadway font-black tracking-widest text-emerald-300 block mb-0.5">
              🎉 RESPUESTA CORRECTA
            </span>
            <div className="text-2xl sm:text-4xl font-broadway text-emerald-200 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">
              {currentTriviaQuestion.correctAnswer}
            </div>
            {currentTriviaQuestion.hint && (
              <p className="text-xs sm:text-sm text-amber-200/90 font-vintage mt-1.5 italic">
                💡 {currentTriviaQuestion.hint}
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
          {buzzerLocked && buzzerWinner && !triviaRevealed && (
            <motion.div
              key="buzzer-active-trivia"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-5 p-3.5 sm:p-4 rounded-2xl border-2 bg-[#07070a]/95 backdrop-blur-md flex items-center justify-between shadow-xl"
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
                    {triviaReboundActive ? '⚡ ¡Rebote cazado por:' : '⚡ ¡Pulsó primero:'} {buzzerWinner.playerName}!
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

