import React from 'react';
import { motion } from 'framer-motion';
import { GAMES_CATALOG } from '../../lib/games';
import { PowerCard, POWER_CARDS_CATALOG } from '../../lib/powerCards';
import PowerCardView from '../PowerCardView';

interface TvPresentationViewProps {
  currentSlide: number;
  selectedPresentationCard: PowerCard | null;
  onSelectPresentationCard: (card: PowerCard | null) => void;
}

export const TvPresentationView: React.FC<TvPresentationViewProps> = ({
  currentSlide,
  selectedPresentationCard,
  onSelectPresentationCard,
}) => {
  return (
    <section className="flex-1 flex flex-col justify-center items-center my-3 z-10 w-full max-w-7xl mx-auto px-2">
      {/* CABECERA PRESENTACIÓN TEATRAL 1930s */}
      <div className="w-full flex items-center justify-between bg-[#0c0c14]/90 border-2 border-[#d4af37]/40 px-6 py-3.5 rounded-2xl mb-4 backdrop-blur-xl shadow-deco-gold">
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

      {/* DIAPOSITIVA 0: LOS 10 MINIJUEGOS Y CARTEL */}
      {currentSlide === 0 && (
        <motion.div
          key="slide-games"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="w-full grid grid-cols-12 gap-5 items-stretch flex-1 min-h-0"
        >
          {/* CARTEL DEL EVENTO */}
          <div className="col-span-5 bg-[#0c0c14]/90 border-2 border-[#d4af37]/50 rounded-3xl p-3.5 flex flex-col items-center justify-center backdrop-blur-xl shadow-deco-gold relative overflow-hidden group">
            <div className="relative w-full h-[590px] rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-[#d4af37]/30 shadow-inner">
              <img
                src="/presentation_games.jpg"
                alt="Cartel 10 Minijuegos"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
            <div className="w-full mt-2 text-center">
              <span className="text-[11px] font-vintage uppercase tracking-widest text-amber-300 flex items-center justify-center gap-1.5">
                <span>🏆</span> 10 Retos • Puntuación Progresiva • Elenco en Vivo
              </span>
            </div>
          </div>

          {/* LISTA COMPLETA DE LOS 10 JUEGOS EN ORDEN CON ESTILO BROADWAY */}
          <div className="col-span-7 bg-[#0c0c14]/90 border-2 border-[#d4af37]/40 rounded-3xl p-5 flex flex-col backdrop-blur-xl shadow-2xl justify-between">
            <div className="mb-3">
              <h3 className="text-2xl font-broadway uppercase text-gold-gradient tracking-wider flex items-center gap-2">
                <span>🔥</span> CARTELERA DE LA NOCHE
              </h3>
              <p className="text-xs font-vintage text-amber-100/70 mt-0.5">
                Cada cuadrilla sumará puntos en cada contienda. ¡El podio final coronará al campeón de la noche!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 flex-1">
              {GAMES_CATALOG.slice(0, 10).map((g, idx) => (
                <div
                  key={g.id}
                  className="p-2.5 rounded-2xl bg-[#14141e]/80 border border-[#d4af37]/25 hover:border-[#d4af37]/60 transition-all flex items-start gap-2.5 shadow-md"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#8a6a1a] text-slate-950 font-broadway flex items-center justify-center text-sm font-black shrink-0 shadow-sm border border-[#f5eedb]/30">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{g.emoji}</span>
                      <h4 className="text-xs font-broadway tracking-wide text-white truncate">{g.title}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] uppercase font-vintage tracking-wider text-amber-300">
                        {g.category}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/60 border border-[#d4af37]/30 text-amber-200/90 font-vintage font-bold">
                        {g.engine === 'buzzer' ? '⚡ Pulsador de Latón' : '🎲 En Vivo'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{g.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-[#d4af37]/30 flex items-center justify-between text-xs text-amber-200/80">
              <span className="font-vintage tracking-wide flex items-center gap-1.5 text-amber-300 font-bold">
                <span>👑</span> El Maestro de Ceremonias iniciará la velada en breve
              </span>
              <span className="text-[11px] bg-black/60 border border-[#d4af37]/30 px-3 py-1 rounded-full text-amber-200 font-vintage uppercase tracking-wider font-bold">
                Puntuación en tiempo real
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
          {/* TRES REGLAS CLAVE */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#0c0c14]/90 border-2 border-[#d4af37]/35 backdrop-blur-xl text-center space-y-1 shadow-lg">
              <span className="text-2xl">🃏</span>
              <h4 className="text-sm font-broadway tracking-wider text-gold-gradient uppercase">1. Obtención de Naipes</h4>
              <p className="text-xs font-vintage text-amber-100/70">
                Se reparten al inicio y como recompensas de bonus por ganar o deslumbrar en cada prueba.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#0c0c14]/90 border-2 border-[#d4af37]/35 backdrop-blur-xl text-center space-y-1 shadow-lg">
              <span className="text-2xl">📲</span>
              <h4 className="text-sm font-broadway tracking-wider text-gold-gradient uppercase">2. Uso en la Partida</h4>
              <p className="text-xs font-vintage text-amber-100/70">
                Los equipos las juegan desde la pantalla de su móvil. Sus efectos se proyectan al instante en la TV.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#0c0c14]/90 border-2 border-[#d4af37]/35 backdrop-blur-xl text-center space-y-1 shadow-lg">
              <span className="text-2xl">⏱️</span>
              <h4 className="text-sm font-broadway tracking-wider text-gold-gradient uppercase">3. Expiración de Efectos</h4>
              <p className="text-xs font-vintage text-amber-100/70">
                Duran durante la ronda o prueba activa. Al finalizar el minijuego, se descartan solas.
              </p>
            </div>
          </div>

          {/* LAS 4 RAREZAS CON EJEMPLOS REALES */}
          <div className="grid grid-cols-4 gap-4 flex-1">
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
                sampleCardId: 'caza_lider',
                badge: 'Poder Avanzado',
                desc: 'Multiplicador doble de puntos, caza implacable al líder y ruleta rusa.',
              },
              {
                rarity: 'Legendaria',
                colorText: 'text-amber-300',
                colorBorder: 'border-[#d4af37]',
                colorBg: 'from-amber-950/40 to-slate-950',
                glow: '#d4af37',
                icon: '🟡',
                sampleCardId: 'el_cuarto_mono',
                badge: 'Giro Legendario',
                desc: 'Limitaciones sensoriales (el mono), el titiritero cómico, robo del siglo y golpe maestro.',
              },
            ].map((r) => {
              const sampleCard =
                POWER_CARDS_CATALOG.find((c: PowerCard) => c.id === r.sampleCardId) || POWER_CARDS_CATALOG[0];
              return (
                <div
                  key={r.rarity}
                  className={`p-4 rounded-3xl bg-gradient-to-b ${r.colorBg} border-2 ${r.colorBorder} flex flex-col justify-between items-center text-center shadow-2xl relative overflow-hidden`}
                >
                  <div
                    className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full opacity-30 blur-2xl pointer-events-none"
                    style={{ backgroundColor: r.glow }}
                  />
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{r.icon}</span>
                      <span
                        className={`text-[10px] font-vintage uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-current ${r.colorText}`}
                      >
                        {r.badge}
                      </span>
                    </div>
                    <h4 className={`text-xl font-broadway uppercase tracking-wider ${r.colorText}`}>{r.rarity}</h4>
                    <p className="text-[11px] font-vintage text-slate-300 mt-1 mb-3">{r.desc}</p>
                  </div>

                  <div
                    onClick={() => onSelectPresentationCard(sampleCard)}
                    className="my-1.5 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 flex flex-col items-center group/card"
                    title="Pulsa para ver la carta ampliada en alta resolución"
                  >
                    <PowerCardView card={sampleCard} size="md" priority={true} />
                    <span className="text-[10px] text-amber-300/80 group-hover/card:text-amber-200 uppercase font-vintage tracking-wider mt-1.5 flex items-center gap-1">
                      <span>🔍</span> Ampliar detalle
                    </span>
                  </div>

                  <span className="text-[11px] text-amber-200/90 font-broadway uppercase tracking-wider">
                    Ejemplo: {sampleCard.name}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* MODAL SPOTLIGHT CINEMATOGRÁFICO DE ALTA RESOLUCIÓN */}
      {selectedPresentationCard && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6"
          onClick={() => onSelectPresentationCard(null)}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            className="relative max-w-md w-full bg-[#0c0c14] border-3 border-[#d4af37] rounded-3xl p-6 shadow-[0_0_80px_rgba(212,175,55,0.4)] flex flex-col items-center text-center deco-card-frame"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => onSelectPresentationCard(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/80 border border-[#d4af37]/60 text-amber-200 hover:text-white flex items-center justify-center text-sm font-bold active:scale-90 shadow-lg"
            >
              ✕
            </button>

            <div className="mb-3">
              <span className="text-xs uppercase font-vintage tracking-widest text-amber-300 block">
                CARTA DE PODER · RAREZA {selectedPresentationCard.rarity.toUpperCase()}
              </span>
              <h3 className="text-2xl font-broadway uppercase tracking-wider text-gold-gradient mt-0.5">
                {selectedPresentationCard.name}
              </h3>
            </div>

            <div className="my-2 drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]">
              <PowerCardView card={selectedPresentationCard} size="lg" priority={true} />
            </div>

            <div className="mt-4 p-3.5 rounded-2xl bg-black/70 border border-[#d4af37]/40 w-full">
              <span className="text-[11px] uppercase font-vintage text-amber-300 tracking-wider font-bold block mb-1">
                Regla y Efecto de Casino:
              </span>
              <p className="text-sm font-editorial text-amber-100/90 leading-relaxed">
                {selectedPresentationCard.description}
              </p>
              <span className="inline-block mt-2 text-[10px] text-amber-400/80 font-vintage uppercase tracking-widest">
                ⏱️ Momento de juego: {selectedPresentationCard.timing}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};
