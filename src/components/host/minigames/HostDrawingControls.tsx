import React from 'react';

export const HostDrawingControls: React.FC = () => {
  return (
    <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/50 rounded-3xl p-6 shadow-deco-gold space-y-4 deco-card-frame">
      <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎨</span>
          <span className="text-sm font-broadway uppercase tracking-wider text-gold-gradient">
            Teléfono Dibujado — Dinámica en Papel Real
          </span>
        </div>
        <div className="text-xs font-vintage font-bold text-amber-300 bg-amber-500/15 border border-[#d4af37]/40 px-3 py-1 rounded-full">
          Decisión libre del Jugador 1
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#07070a]/90 border border-[#d4af37]/40 text-left space-y-2">
        <div className="flex items-center gap-2 text-amber-300 text-xs font-broadway uppercase">
          <span>💡</span>
          <span>Sin palabras previas impuestas</span>
        </div>
        <p className="text-xs font-vintage text-amber-100/90 leading-relaxed">
          El <strong>Jugador 1</strong> de cada equipo decide libremente qué frase, palabra o concepto va a dibujar en el primer folio para iniciar la cadena (no requiere de frases generadas por el sistema).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] text-amber-200/80">
          <div className="bg-[#14141e] p-2.5 rounded-xl border border-[#d4af37]/30 font-vintage">
            <span className="text-amber-400 font-broadway block mb-0.5">1.º Turno (Dibujo)</span>
            J1 piensa su idea y la dibuja. Dobla el papel y se lo entrega a J2.
          </div>
          <div className="bg-[#14141e] p-2.5 rounded-xl border border-[#d4af37]/30 font-vintage">
            <span className="text-amber-300 font-broadway block mb-0.5">2.º Turno (Texto)</span>
            J2 solo ve el dibujo, escribe lo que cree que es, dobla para ocultar el dibujo y pasa a J3.
          </div>
          <div className="bg-[#14141e] p-2.5 rounded-xl border border-[#d4af37]/30 font-vintage">
            <span className="text-emerald-400 font-broadway block mb-0.5">Final y Revelación</span>
            Se despliegan todos los folios en la sala, se comprueba la evolución y se asignan los puntos.
          </div>
        </div>
      </div>

      <p className="text-xs font-vintage text-amber-200/70 text-center">
        📝 Se juega presencialmente en papel real. Al terminar la cadena, asigna las puntuaciones con los botones superiores.
      </p>
    </div>
  );
};
