import React from 'react';
import { Award, Palette, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { Team } from '../../../lib/types';
import { TEAMS_CATALOG } from '../../../lib/constants';
import { ScoringOption } from '../../../lib/games';

export interface HostDrawingControlsProps {
  activeTeams: Team[];
  selectedTeamForPoints: string;
  onSelectTeamForPoints: (teamId: string) => void;
  roundHits: Record<string, number>;
  onApplyScoreAction: (opt: ScoringOption) => void;
}

export const HostDrawingControls: React.FC<HostDrawingControlsProps> = ({
  activeTeams,
  selectedTeamForPoints,
  onSelectTeamForPoints,
  roundHits,
  onApplyScoreAction,
}) => {
  const currentTeam = activeTeams.find((t) => t.id === selectedTeamForPoints) || activeTeams[0];
  const currentCatalog = currentTeam
    ? TEAMS_CATALOG.find((c) => c.index === currentTeam.team_index) || TEAMS_CATALOG[0]
    : TEAMS_CATALOG[0];
  const currentHits = currentTeam ? roundHits[currentTeam.id] || 0 : 0;

  const handleApply = (opt: ScoringOption) => {
    if (!currentTeam) return;
    onSelectTeamForPoints(currentTeam.id);
    onApplyScoreAction(opt);
  };

  return (
    <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/50 rounded-3xl p-5 sm:p-6 shadow-deco-gold space-y-5 hell-card-frame">
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#d4af37]/30 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-broadway uppercase tracking-wider text-gold-gradient">
              Teléfono Dibujado — Panel de Valoración
            </h3>
            <span className="text-[11px] font-vintage text-amber-200/70">
              Dinámica en papel real: J1 dibuja ➔ J2 escribe ➔ J3 dibuja ➔ J4 escribe ➔ J5 dibuja
            </span>
          </div>
        </div>
        <div className="text-xs font-vintage font-bold text-amber-300 bg-amber-500/15 border border-[#d4af37]/40 px-3 py-1 rounded-full self-start sm:self-auto flex items-center gap-1.5">
          <span>💡</span>
          <span>J1 decide libremente qué dibujar</span>
        </div>
      </div>

      {/* SELECTOR DE EQUIPO A CALIFICAR */}
      <div>
        <span className="text-xs font-vintage text-amber-200/80 block mb-2 font-bold uppercase tracking-wider">
          Selecciona el equipo a puntuar:
        </span>
        <div className="flex flex-wrap gap-2">
          {activeTeams.map((team) => {
            const catalog = TEAMS_CATALOG.find((c) => c.index === team.team_index) || TEAMS_CATALOG[0];
            const isSelected = team.id === currentTeam?.id;
            const hits = roundHits[team.id] || 0;

            return (
              <button
                key={team.id}
                onClick={() => onSelectTeamForPoints(team.id)}
                className={`px-3.5 py-2 rounded-xl border font-broadway text-xs flex items-center gap-2 transition-all active:scale-95 shadow-sm ${
                  isSelected
                    ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-deco-gold'
                    : 'bg-[#14141e] hover:bg-[#1a1a28] border-[#d4af37]/30 text-amber-100/70'
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${catalog.twBg} shadow-sm`} />
                <span>{team.name}</span>
                <span className="text-[10px] font-vintage bg-black/40 px-1.5 py-0.5 rounded border border-white/10 text-amber-300">
                  {hits} {hits === 1 ? 'acierto' : 'aciertos'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TARJETA DE ACCIONES RÁPIDAS PARA EL EQUIPO SELECCIONADO */}
      {currentTeam && (
        <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-2xl p-4 sm:p-5 shadow-inner">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-full ${currentCatalog.twBg}`} />
              <span className="text-sm font-broadway text-white uppercase tracking-wide">
                Calificando a: <strong className="text-gold-gradient">{currentTeam.name}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-vintage font-bold text-amber-300 bg-black/50 px-3 py-1 rounded-lg border border-[#d4af37]/30">
              <span>🎯 Aciertos acumulados:</span>
              <strong className="text-amber-400 font-broadway text-sm">{currentHits}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. CADENA INTACTA (+5 ACIERTOS) */}
            <button
              onClick={() =>
                handleApply({
                  id: 'draw_exact',
                  label: '🎯 Cadena Intacta J1 ➔ J5 (+5)',
                  delta: 5,
                  hitsDelta: 5,
                  badge: '+5',
                  color: 'amber',
                  description: 'Lo del J1 llegó igual al J5 (+5 aciertos)',
                })
              }
              className="p-3.5 rounded-2xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/50 hover:border-amber-400 text-left transition-all active:scale-95 shadow-md flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="text-xs font-broadway text-amber-200 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  <span>Cadena Intacta (J1 ➔ J5)</span>
                </span>
                <span className="text-xs font-black font-mono px-2 py-0.5 rounded-lg bg-amber-500/30 text-amber-300 border border-amber-400/40">
                  +5 Aciertos
                </span>
              </div>
              <p className="text-[11px] font-vintage text-amber-100/70">
                El concepto de J1 llegó intacto a la obra final de J5 (+5 aciertos y +5 pts).
              </p>
            </button>

            {/* 2. PREMIO MEJOR DIBUJO (+2 ACIERTOS) */}
            <button
              onClick={() =>
                handleApply({
                  id: 'draw_best',
                  label: '🎨 Premio Mejor Dibujo (+2)',
                  delta: 2,
                  hitsDelta: 2,
                  badge: '+2',
                  color: 'emerald',
                  description: 'Veredicto al dibujo más artístico (+2 aciertos)',
                })
              }
              className="p-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/50 hover:border-emerald-400 text-left transition-all active:scale-95 shadow-md flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="text-xs font-broadway text-emerald-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Premio Mejor Dibujo</span>
                </span>
                <span className="text-xs font-black font-mono px-2 py-0.5 rounded-lg bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                  +2 Aciertos
                </span>
              </div>
              <p className="text-[11px] font-vintage text-emerald-100/70">
                Votado como el dibujo con mayor arte, detalle o mérito (+2 aciertos y +2 pts).
              </p>
            </button>

            {/* 3. PREMIO PEOR DIBUJO (+1 ACIERTO) */}
            <button
              onClick={() =>
                handleApply({
                  id: 'draw_worst',
                  label: '🤪 Premio Peor Dibujo (+1)',
                  delta: 1,
                  hitsDelta: 1,
                  badge: '+1',
                  color: 'purple',
                  description: 'Veredicto al dibujo más cómico o desastroso (+1 acierto)',
                })
              }
              className="p-3.5 rounded-2xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/50 hover:border-purple-400 text-left transition-all active:scale-95 shadow-md flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="text-xs font-broadway text-purple-200 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>Premio Peor Dibujo</span>
                </span>
                <span className="text-xs font-black font-mono px-2 py-0.5 rounded-lg bg-purple-500/30 text-purple-300 border border-purple-400/40">
                  +1 Acierto
                </span>
              </div>
              <p className="text-[11px] font-vintage text-purple-100/70">
                Votado como el dibujo más cómico, desastroso o surrealista (+1 acierto y +1 pt).
              </p>
            </button>
          </div>
        </div>
      )}

      {/* RESUMEN DE LA DINÁMICA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-amber-200/80">
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
          Se despliegan todos los folios en la sala, se comprueba la evolución y se otorgan los premios.
        </div>
      </div>
    </div>
  );
};
