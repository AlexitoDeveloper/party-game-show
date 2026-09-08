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
    <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/50 rounded-3xl p-6 shadow-deco-gold space-y-5 deco-card-frame">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d4af37]/30 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{currentTriviaQuestion.categoryEmoji}</span>
          <span className="text-sm font-broadway uppercase tracking-wider text-gold-gradient">
            Pregunta {triviaIndex + 1}/{triviaBank.length} — {currentTriviaQuestion.category}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {triviaReboundActive && (
            <span className="px-3 py-1 rounded-full bg-gold-gradient text-slate-950 border border-[#f5eedb]/40 text-xs font-broadway font-black animate-pulse shadow-sm">
              🔄 Rebote Activo (+1 pt)
            </span>
          )}
          <button
            onClick={onRandomTrivia}
            className="px-3 py-1 bg-[#14141e] hover:bg-[#1a1a28] text-amber-200 rounded-xl text-xs font-vintage font-bold border border-[#d4af37]/30 flex items-center gap-1.5 shadow-sm"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span>Aleatoria</span>
          </button>
        </div>
      </div>

      {/* TARJETA CHIVATO SECRETO PARA EL HOST */}
      <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="text-xs uppercase font-broadway text-amber-400">
          {currentTriviaQuestion.options ? 'Pregunta Tipo Test (Opciones en TV)' : 'Pregunta Abierta Directa'}
        </div>
        <h3 className="text-lg font-broadway text-amber-50">
          {currentTriviaQuestion.question}
        </h3>

        {currentTriviaQuestion.options && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {currentTriviaQuestion.options.map((opt, oIdx) => (
              <div
                key={oIdx}
                className={`p-2.5 rounded-xl border ${
                  currentTriviaQuestion.correctAnswer.toLowerCase().includes(opt.toLowerCase())
                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 font-broadway font-black shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                    : 'bg-[#14141e] border-[#d4af37]/30 text-amber-100 font-vintage font-bold'
                }`}
              >
                {String.fromCharCode(65 + oIdx)}) {opt}
              </div>
            ))}
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-[#07070a] border-2 border-emerald-400/60 flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] uppercase font-broadway font-black text-emerald-400 block">Respuesta Correcta:</span>
            <span className="text-base font-broadway text-emerald-300">{currentTriviaQuestion.correctAnswer}</span>
          </div>
          {currentTriviaQuestion.hint && (
            <span className="text-xs text-amber-200/70 font-vintage italic">Pista: {currentTriviaQuestion.hint}</span>
          )}
        </div>
      </div>

      {/* BOTONES DE VALIDACIÓN Y REBOTE */}
      <div className="bg-[#14141e] border border-[#d4af37]/40 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-deco-gold">
        <div className="flex items-center gap-2">
          <span className="text-xs font-broadway text-amber-300 uppercase">
            Veredicto del Host:
          </span>
          {winner ? (
            <span className="px-2.5 py-1 rounded-xl bg-gold-gradient text-slate-950 font-broadway font-black text-xs shadow-sm">
              Equipo: {winner.teamName}
            </span>
          ) : (
            <span className="text-xs font-vintage text-amber-200/60">Pulsador libre</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {triviaReboundActive ? (
            <button
              onClick={onValidateTriviaReboundHit}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-gold-gradient text-slate-950 font-broadway font-black rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 shadow-deco-gold border border-[#f5eedb]/40 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Validar Rebote (+1 pt)</span>
            </button>
          ) : (
            <>
              <button
                onClick={onValidateTriviaHit}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-broadway font-black rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Correcto (+2 pts)</span>
              </button>
              <button
                onClick={onValidateTriviaFail}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-broadway font-bold rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95"
              >
                <X className="w-4 h-4" />
                <span>Fallo y Rebote (-1 pt)</span>
              </button>
            </>
          )}
          <button
            onClick={onToggleTriviaReveal}
            className={`px-3 py-2.5 rounded-xl text-xs font-broadway font-bold border transition-all ${
              triviaRevealed
                ? 'bg-gold-gradient text-slate-950 border-[#f5eedb]/50 shadow-deco-gold font-black'
                : 'bg-[#07070a] text-amber-200 border-[#d4af37]/40 hover:bg-[#1a1a28]'
            }`}
          >
            {triviaRevealed ? 'Ocultar Solución TV' : 'Mostrar Solución TV'}
          </button>
        </div>
      </div>

      {/* NAVEGADOR DE PREGUNTAS */}
      <div className="flex items-center justify-between gap-3 bg-[#07070a]/80 p-3 rounded-2xl border border-[#d4af37]/30">
        <button
          onClick={onPrevTrivia}
          className="p-2 bg-[#14141e] hover:bg-[#1a1a28] border border-[#d4af37]/30 rounded-xl text-amber-200 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-vintage font-bold text-amber-200/80">
          Pregunta {triviaIndex + 1} de {triviaBank.length}
        </span>
        <button
          onClick={onNextTrivia}
          className="px-4 py-2 bg-gold-gradient hover:brightness-110 text-slate-950 font-broadway font-black rounded-xl text-xs uppercase flex items-center gap-1.5 shadow-deco-gold active:scale-95 border border-[#f5eedb]/40"
        >
          <span>Siguiente Pregunta</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
