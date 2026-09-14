import React from 'react';
import { motion } from 'framer-motion';
import { PowerCard, POWER_CARDS_CATALOG } from '../../lib/powerCards';
import PowerCardView from '../PowerCardView';

interface TvPresentationViewProps {
  currentSlide: number;
  selectedPresentationCard?: PowerCard | null;
  onSelectPresentationCard?: (card: PowerCard | null) => void;
}

export const TvPresentationView: React.FC<TvPresentationViewProps> = ({
  currentSlide,
}) => {
  return (
    <section className="flex-1 h-full min-h-0 flex flex-col justify-between items-center z-10 w-full max-w-[1720px] mx-auto px-4 py-1 overflow-hidden">
      {/* CABECERA PRESENTACIÓN TEATRAL 1930s */}
      <div className="w-full shrink-0 flex items-center justify-between bg-[#0c0c14]/90 border-2 border-[#d4af37]/40 px-5 py-2 rounded-2xl mb-2 backdrop-blur-xl shadow-deco-gold">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-pulse">✨</span>
          <div>
            <span className="text-[11px] font-vintage uppercase tracking-widest text-amber-300/80 block">
              PROGRAMA TEATRAL OFICIAL DE LA VELADA
            </span>
            <h2 className="text-xl font-broadway tracking-wider text-gold-gradient uppercase">
              {currentSlide === 0 ? 'Los 10 Grandes Desafíos' : 'Cartas de Poder y Rarezas de Casino'}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3.5 py-1.5 rounded-xl text-xs font-broadway uppercase tracking-wider border transition-all ${
              currentSlide === 0
                ? 'bg-gold-gradient text-slate-950 border-[#f5eedb] shadow-deco-gold font-black'
                : 'bg-[#12121c] text-slate-400 border-[#d4af37]/20 font-medium'
            }`}
          >
            1. Desafíos
          </span>
          <span
            className={`px-3.5 py-1.5 rounded-xl text-xs font-broadway uppercase tracking-wider border transition-all ${
              currentSlide === 1
                ? 'bg-gold-gradient text-slate-950 border-[#f5eedb] shadow-deco-gold font-black'
                : 'bg-[#12121c] text-slate-400 border-[#d4af37]/20 font-medium'
            }`}
          >
            2. Cartas de Poder
          </span>
        </div>
      </div>

      {/* DIAPOSITIVA 0: CARTEL OFICIAL DE LOS 10 DESAFÍOS */}
      {currentSlide === 0 && (
        <motion.div
          key="slide-games"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="w-full flex-1 min-h-0 flex flex-col items-center justify-center overflow-hidden py-0.5"
        >
          {/* CARTEL DEL EVENTO */}
          <div className="h-full max-h-[calc(100vh-230px)] aspect-square w-auto bg-[#0c0c14]/90 border-2 border-[#d4af37]/50 rounded-2xl sm:rounded-3xl p-2.5 flex flex-col items-center justify-center backdrop-blur-xl shadow-deco-gold relative overflow-hidden group hell-card-frame">
            {/* Esquinas ornamentales con palos de póker */}
            <span className="absolute top-1.5 left-2.5 text-xs text-[#d4af37]/70 font-serif select-none z-10">♠</span>
            <span className="absolute top-1.5 right-2.5 text-xs text-red-500/80 font-serif select-none z-10">♥</span>
            <span className="absolute bottom-1.5 left-2.5 text-xs text-[#d4af37]/70 font-serif select-none z-10">♣</span>
            <span className="absolute bottom-1.5 right-2.5 text-xs text-red-500/80 font-serif select-none z-10">♦</span>

            <div className="relative w-full flex-1 min-h-0 rounded-xl sm:rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-[#d4af37]/30 shadow-inner">
              <img
                src="/presentation_games.jpg"
                alt="Cartel Oficial 10 Grandes Desafíos"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
            <div className="w-full shrink-0 mt-1.5 text-center">
              <span className="text-[11px] sm:text-xs font-vintage uppercase tracking-widest text-amber-300 flex items-center justify-center gap-2 font-bold">
                <span>🏆</span> 10 Retos • Puntuación Progresiva • Elenco en Vivo
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* DIAPOSITIVA 1: SISTEMA DE CARTAS Y RAREZAS */}
      {currentSlide === 1 && (
        <motion.div
          key="slide-cards"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="w-full flex flex-col gap-4 flex-1"
        >
          {/* TRES REGLAS CLAVE EN TIRA ELEGANTE Y COMPACTA */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-[#0c0c14]/90 border border-[#d4af37]/35 rounded-xl px-5 py-2 text-xs font-vintage text-amber-100/90 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-base">🃏</span>
              <span><strong className="text-gold-gradient font-broadway uppercase">1. Obtención:</strong> Mazo inicial y bonus por triunfos</span>
            </div>
            <div className="text-[#d4af37]/40 font-bold hidden sm:inline">•</div>
            <div className="flex items-center gap-2">
              <span className="text-base">📲</span>
              <span><strong className="text-gold-gradient font-broadway uppercase">2. Uso:</strong> Desde el móvil, proyectadas en vivo en TV</span>
            </div>
            <div className="text-[#d4af37]/40 font-bold hidden sm:inline">•</div>
            <div className="flex items-center gap-2">
              <span className="text-base">⏱️</span>
              <span><strong className="text-gold-gradient font-broadway uppercase">3. Expiración:</strong> Activas durante la prueba en curso</span>
            </div>
          </div>

          {/* LAS 4 RAREZAS CON EJEMPLOS REALES */}
          <div className="grid grid-cols-4 gap-3.5 flex-1 min-h-0">
            {[
              {
                rarity: 'Común',
                colorText: 'text-emerald-400',
                colorBorder: 'border-emerald-500/50',
                colorBg: 'from-emerald-950/40 to-slate-950',
                glow: '#10b981',
                icon: '🟢',
                sampleCardId: 'bomba',
                badge: 'Efectos Básicos',
                desc: 'Baneos de turno, bombas trampa, pérdidas rápidas y marcas de objetivo.',
              },
              {
                rarity: 'Rara',
                colorText: 'text-blue-400',
                colorBorder: 'border-blue-500/50',
                colorBg: 'from-blue-950/40 to-slate-950',
                glow: '#3b82f6',
                icon: '🔵',
                sampleCardId: 'banco_cartas',
                badge: 'Impacto Táctico',
                desc: 'Banco de cartas del mazo, intercambio de manos, escudo e inmunidad.',
              },
              {
                rarity: 'Épica',
                colorText: 'text-purple-400',
                colorBorder: 'border-purple-500/50',
                colorBg: 'from-purple-950/40 to-slate-950',
                glow: '#a855f7',
                icon: '🟣',
                sampleCardId: 'el_cuarto_mono',
                badge: 'Poder Avanzado',
                desc: 'Limitaciones sensoriales (El Cuarto Mono), caza al líder y ruleta rusa.',
              },
              {
                rarity: 'Legendaria',
                colorText: 'text-amber-300',
                colorBorder: 'border-[#d4af37]',
                colorBg: 'from-amber-950/40 to-slate-950',
                glow: '#d4af37',
                icon: '🟡',
                sampleCardId: 'impuesto_padrino',
                badge: 'Giro Legendario',
                desc: 'Impuesto del Padrino (50% comisión), Robo del Siglo, Ave Fénix y Golpe Maestro.',
              },
            ].map((r) => {
              const sampleCard =
                POWER_CARDS_CATALOG.find((c: PowerCard) => c.id === r.sampleCardId) || POWER_CARDS_CATALOG[0];
              return (
                <div
                  key={r.rarity}
                  className={`p-3 rounded-2xl bg-gradient-to-b ${r.colorBg} border-2 ${r.colorBorder} flex flex-col justify-between items-center text-center shadow-2xl relative overflow-hidden`}
                >
                  <div
                    className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full opacity-30 blur-2xl pointer-events-none"
                    style={{ backgroundColor: r.glow }}
                  />
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">{r.icon}</span>
                      <span
                        className={`text-[9px] font-vintage uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/90 border border-current ${r.colorText}`}
                      >
                        {r.badge}
                      </span>
                    </div>
                    <h4 className={`text-lg font-broadway uppercase tracking-wider ${r.colorText}`}>{r.rarity}</h4>
                    <p className="text-[11px] font-vintage text-amber-100/80 mt-0.5 mb-1.5 leading-tight">{r.desc}</p>
                  </div>

                  <div className="my-auto flex flex-col items-center select-none pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]">
                    <PowerCardView card={sampleCard} size="presentation" priority={true} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </section>
  );
};
