import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { TriviaQuestion } from '../../../lib/triviaData';
import { BuzzerPressPayload } from '../../../lib/types';

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

        {/* Revelación de Solución */}
        {triviaRevealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-5 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#07070a] to-emerald-950/90 border-2 border-emerald-400/80 text-center shadow-2xl"
          >
            <span className="text-sm sm:text-base uppercase font-broadway font-black tracking-widest text-emerald-300 block mb-1">
              🎉 RESPUESTA CORRECTA
            </span>
            <div className="text-3xl sm:text-5xl font-broadway text-emerald-200 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">
              {currentTriviaQuestion.correctAnswer}
            </div>
            {currentTriviaQuestion.hint && (
              <p className="text-base sm:text-lg text-amber-200/90 font-vintage mt-2 italic">
                💡 {currentTriviaQuestion.hint}
              </p>
            )}
          </motion.div>
        )}

        {/* Turno activo de respuesta */}
        <AnimatePresence mode="wait">
          {buzzerLocked && buzzerWinner && (
            <motion.div
              key="buzzer-active"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 p-4 sm:p-5 rounded-2xl border-2 border-amber-400 bg-[#1a1408]/95 backdrop-blur-md flex items-center justify-between shadow-xl"
            >
              <div className="flex items-center gap-3.5">
                <span className="text-3xl sm:text-4xl animate-bounce">⚡</span>
                <div className="text-left">
                  <span className="text-xs sm:text-sm uppercase font-broadway tracking-wider text-amber-300">
                    {triviaReboundActive ? '¡Rebote cazado por:' : '¡Pulsó primero:'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-broadway text-gold-gradient">{buzzerWinner.teamName}</div>
                </div>
              </div>
              <div className="text-sm sm:text-base font-vintage font-bold text-amber-300 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                <span>Respondiendo...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
