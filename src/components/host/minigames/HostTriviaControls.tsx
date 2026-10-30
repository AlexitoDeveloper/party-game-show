import React from 'react';
import { Shuffle, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { TriviaQuestion } from '../../../lib/triviaData';
import { BuzzerPressPayload } from '../../../lib/types';

export interface HostTriviaControlsProps {
  currentTriviaQuestion: TriviaQuestion;
  triviaIndex: number;
  triviaBank: TriviaQuestion[];
  triviaReboundActive: boolean;
  winner: BuzzerPressPayload | null;
  triviaRevealed: boolean;
  onRandomTrivia: () => void;
  onValidateTriviaHit: () => void;
  onValidateTriviaFail: () => void;
  onValidateTriviaReboundHit: () => void;
  onToggleTriviaReveal: () => void;
  onPrevTrivia: () => void;
  onNextTrivia: () => void;
}

export const HostTriviaControls: React.FC<HostTriviaControlsProps> = ({
  currentTriviaQuestion,
  triviaIndex,
  triviaBank,
  triviaReboundActive,
  winner,
  triviaRevealed,
  onRandomTrivia,
  onValidateTriviaHit,
  onValidateTriviaFail,
  onValidateTriviaReboundHit,
  onToggleTriviaReveal,
  onPrevTrivia,
  onNextTrivia,
}) => {
  return (
    <div className="pt-2 border-t border-[#d4af37]/30 space-y-3">
      {/* CABECERA COMPACTA: NAVEGACIÓN + ALEATORIA */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-base shrink-0">{currentTriviaQuestion.categoryEmoji}</span>
          <span className="text-xs font-broadway uppercase tracking-wider text-gold-gradient truncate">
            {triviaIndex + 1}/{triviaBank.length} • {currentTriviaQuestion.category}
          </span>
          {triviaReboundActive && (
            <span className="px-2 py-0.5 rounded-full bg-gold-gradient text-slate-950 text-[10px] font-broadway font-black animate-pulse shrink-0">
              🔄 Rebote
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onRandomTrivia}
            className="px-2.5 py-1.5 bg-[#14141e] hover:bg-[#1a1a28] text-amber-200 rounded-xl text-xs font-vintage font-bold border border-[#d4af37]/30 flex items-center gap-1"
            title="Pregunta aleatoria"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span>Azar</span>
          </button>
          <button
            onClick={onPrevTrivia}
            className="p-1.5 bg-[#14141e] hover:bg-[#1a1a28] border border-[#d4af37]/30 rounded-xl text-amber-200 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextTrivia}
            className="px-3 py-1.5 bg-gold-gradient text-slate-950 font-broadway font-black rounded-xl text-xs uppercase flex items-center gap-1 shadow-sm active:scale-95"
          >
            <span>Sig.</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TARJETA CHIVATO COMPACTA PARA EL HOST */}
      <div className="bg-[#07070a]/95 border border-[#d4af37]/40 rounded-2xl p-3 space-y-2.5 shadow-md">
        <h3 className="text-sm sm:text-base font-broadway text-amber-50 leading-snug">
          {currentTriviaQuestion.question}
        </h3>

        {currentTriviaQuestion.options && (
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {currentTriviaQuestion.options.map((opt, oIdx) => {
              const isCorrect = currentTriviaQuestion.correctAnswer
                .toLowerCase()
                .includes(opt.toLowerCase());
              return (
                <div
                  key={oIdx}
                  className={`p-2 rounded-xl border leading-tight ${
                    isCorrect
                      ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 font-broadway font-black'
                      : 'bg-[#14141e] border-[#d4af37]/25 text-amber-100/80 font-vintage'
                  }`}
                >
                  {String.fromCharCode(65 + oIdx)}) {opt}
                </div>
              );
            })}
          </div>
        )}

        <div className="px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-400/50 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-broadway font-black text-emerald-400 block">
              Respuesta Correcta:
            </span>
            <span className="text-sm font-broadway text-emerald-200">
              {currentTriviaQuestion.correctAnswer}
            </span>
          </div>
          {currentTriviaQuestion.hint && (
            <span className="text-[11px] text-amber-200/70 font-vintage italic text-right">
              💡 {currentTriviaQuestion.hint}
            </span>
          )}
        </div>
      </div>

      {/* BOTONES GRANDES DE PULGAR PARA VEREDICTO */}
      <div className="grid grid-cols-3 gap-2">
        {triviaReboundActive ? (
          <button
            onClick={onValidateTriviaReboundHit}
            className="col-span-2 py-3 px-3 bg-gold-gradient text-slate-950 font-broadway font-black rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 shadow-deco-gold active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Validar Rebote (+2)</span>
          </button>
        ) : (
          <>
            <button
              onClick={onValidateTriviaHit}
              className="py-3 px-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-broadway font-black rounded-xl text-xs uppercase flex items-center justify-center gap-1 shadow-md active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Acierto (+2)</span>
            </button>
            <button
              onClick={onValidateTriviaFail}
              className="py-3 px-2 bg-red-600/85 hover:bg-red-600 text-white font-broadway font-bold rounded-xl text-xs uppercase flex items-center justify-center gap-1 shadow-md active:scale-95"
            >
              <X className="w-4 h-4 stroke-[3]" />
              <span>Fallo (-1)</span>
            </button>
          </>
        )}

        <button
          onClick={onToggleTriviaReveal}
          className={`py-3 px-2 rounded-xl text-xs font-broadway font-bold border transition-all active:scale-95 ${
            triviaRevealed
              ? 'bg-purple-600 text-white border-purple-400'
              : 'bg-[#14141e] text-amber-200 border-[#d4af37]/40'
          }`}
        >
          {triviaRevealed ? 'Ocultar TV' : 'Solución TV'}
        </button>
      </div>
    </div>
  );
};
