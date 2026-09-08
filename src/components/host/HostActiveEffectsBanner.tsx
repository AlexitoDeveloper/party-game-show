import React from 'react';
import { Zap, Trash2, RotateCcw } from 'lucide-react';
import { PowerCardsState } from '../../lib/powerCards';
import { Team } from '../../lib/types';

interface HostActiveEffectsBannerProps {
  powerCards: PowerCardsState;
  activeTeams: Team[];
  teams: Team[];
  onClearAllActiveEffects: () => void;
  onScoreChange: (teamId: string, delta: number) => void;
  onRemoveActiveEffect: (effectId: string) => void;
  onReturnCardToTeam: (teamId: string, cardId: string, opts?: { removeEffectId?: string }) => void;
  onTeamsUpdate: (teams: Team[]) => void;
}

export const HostActiveEffectsBanner: React.FC<HostActiveEffectsBannerProps> = ({
  powerCards,
  activeTeams,
  teams,
  onClearAllActiveEffects,
  onScoreChange,
  onRemoveActiveEffect,
  onReturnCardToTeam,
  onTeamsUpdate,
}) => {
  if (powerCards.activeEffects.length === 0) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 p-3 sm:p-4 rounded-2xl space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Efectos de Poder Activos en Esta Prueba:</span>
          <span className="sm:hidden">Efectos Activos ({powerCards.activeEffects.length}):</span>
        </span>
        <button
          onClick={onClearAllActiveEffects}
          className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 active:scale-95 transition-all shadow shrink-0"
          title="Caducar y descartar todos los efectos activos inmediatamente"
        >
          <Trash2 className="w-3 h-3 text-red-400" />
          <span className="hidden sm:inline">Limpiar Efectos</span>
          <span className="sm:hidden">Limpiar</span>
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {powerCards.activeEffects.map((eff) => {
          const team = activeTeams.find((t) => t.id === eff.sourceTeamId);
          const targetTeam = eff.targetTeamId ? activeTeams.find((t) => t.id === eff.targetTeamId) : null;
          return (
            <div
              key={eff.id}
              className="bg-slate-950/95 border-2 border-amber-400/50 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs flex flex-wrap items-center gap-1.5 sm:gap-2 shadow-lg"
            >
              <span>{eff.cardEmoji}</span>
              <strong className="text-white font-bold">{eff.cardName}</strong>
              <span className="text-amber-300 font-bold">({team?.name || eff.sourceTeamName})</span>
              {targetTeam && (
                <span className="text-red-300 font-bold flex items-center gap-0.5">
                  <span>➔ 🎯</span>
                  <span>{targetTeam.name}</span>
                </span>
              )}
              {eff.targetPlayerName && (
                <span className="text-red-300 font-bold flex items-center gap-0.5">
                  <span>➔ 👤</span>
                  <span>{eff.targetPlayerName}</span>
                </span>
              )}
              {eff.sensoryLimitation && (
                <span className="bg-purple-950/80 border border-purple-400/50 text-purple-200 px-2 py-0.5 rounded text-[11px] font-bold">
                  {eff.sensoryLimitation}
                </span>
              )}

              {/* BOTONES INTERACTIVOS SEGÚN LA CARTA */}
              {eff.cardId === 'bomba' && eff.targetTeamId && (
                <button
                  onClick={() => {
                    onScoreChange(eff.targetTeamId!, -3);
                    onRemoveActiveEffect(eff.id);
                  }}
                  className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-[10px] shadow"
                >
                  💣 Detonar (-3 pts)
                </button>
              )}

              {eff.cardId === 'objetivo' && (
                <button
                  onClick={() => {
                    onScoreChange(eff.sourceTeamId, 2);
                    onRemoveActiveEffect(eff.id);
                  }}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] shadow"
                >
                  🎯 Cobrar (+2 pts)
                </button>
              )}

              {eff.cardId === 'caza_lider' && (
                <button
                  onClick={() => {
                    if (eff.targetTeamId) {
                      onScoreChange(eff.targetTeamId, -3);
                    }
                    onScoreChange(eff.sourceTeamId, 3);
                    onRemoveActiveEffect(eff.id);
                  }}
                  className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-[10px] shadow"
                >
                  👑 Destronar (-3 rival / +3 tú)
                </button>
              )}

              {eff.cardId === 'ruleta_rusa' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      onScoreChange(eff.sourceTeamId, 6);
                      onRemoveActiveEffect(eff.id);
                    }}
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] shadow"
                  >
                    +6 pts (1º-2º)
                  </button>
                  <button
                    onClick={() => {
                      onScoreChange(eff.sourceTeamId, -4);
                      onRemoveActiveEffect(eff.id);
                    }}
                    className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-[10px] shadow"
                  >
                    -4 pts (3º-5º)
                  </button>
                </div>
              )}

              {eff.cardId === 'la_sentencia' && eff.targetTeamId && (
                <button
                  onClick={() => {
                    onScoreChange(eff.targetTeamId!, -4);
                    onRemoveActiveEffect(eff.id);
                  }}
                  className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold text-[10px] shadow"
                >
                  💀 Ejecutar (-4 pts)
                </button>
              )}

              {eff.cardId === 'golpe_maestro' && (
                <button
                  onClick={() => {
                    let stolenTotal = 0;
                    const updated = teams.map((t) => {
                      if (t.id === eff.sourceTeamId) return t;
                      if (t.is_active && t.score > 0) {
                        stolenTotal += 1;
                        return { ...t, score: Math.max(0, t.score - 1) };
                      }
                      return t;
                    });
                    const finalTeams = updated.map((t) =>
                      t.id === eff.sourceTeamId ? { ...t, score: t.score + stolenTotal } : t
                    );
                    onTeamsUpdate(finalTeams);
                    onRemoveActiveEffect(eff.id);
                    alert(`💥 ¡Golpe Maestro! ${stolenTotal} pts recolectados de los rivales.`);
                  }}
                  className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-black text-[10px] shadow"
                >
                  💥 Golpe Maestro (+1 de c/u)
                </button>
              )}

              {eff.cardId === 'robo_siglo' && eff.targetTeamId && (
                <button
                  onClick={() => {
                    const tTeam = teams.find((t) => t.id === eff.targetTeamId);
                    const pts = prompt(
                      `¿Cuántos puntos ganó ${tTeam?.name || 'el rival'} en esta prueba? (Se robará el 50%)`,
                      '4'
                    );
                    const num = parseInt(pts || '0', 10);
                    if (num > 0) {
                      const steal = Math.round(num * 0.5);
                      onScoreChange(eff.targetTeamId!, -steal);
                      onScoreChange(eff.sourceTeamId, steal);
                      onRemoveActiveEffect(eff.id);
                      alert(`👑 ¡Robo del Siglo! Has transferido ${steal} pts a tu equipo.`);
                    }
                  }}
                  className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-black text-[10px] shadow"
                >
                  👑 Robo 50%
                </button>
              )}

              {eff.cardId === 'impuesto_padrino' && (
                <button
                  onClick={() => {
                    const pts = prompt(
                      `¿Cuántos puntos consiguió el equipo vencedor en 1.er puesto?\n(Se transferirá el 50% al equipo ${eff.sourceTeamName})`,
                      '4'
                    );
                    const num = parseInt(pts || '0', 10);
                    if (num > 0) {
                      const half = Math.round(num * 0.5);
                      onScoreChange(eff.sourceTeamId, half);
                      onRemoveActiveEffect(eff.id);
                      alert(`🎩 ¡Impuesto del Padrino cobrado! +${half} pts transferidos a ${eff.sourceTeamName}.`);
                    }
                  }}
                  className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-black text-[10px] shadow"
                >
                  🎩 Impuesto 50%
                </button>
              )}

              {eff.cardId === 'ave_fenix' && (
                <button
                  onClick={() => {
                    const pts = prompt(
                      `¿Cuántos puntos base consiguió ${eff.sourceTeamName} en esta prueba?\n(Se sumará el x2 adicional para alcanzar el triple x3)`,
                      '3'
                    );
                    const num = parseInt(pts || '0', 10);
                    if (num > 0) {
                      const bonus = num * 2;
                      onScoreChange(eff.sourceTeamId, bonus);
                      onRemoveActiveEffect(eff.id);
                      alert(
                        `🔥 ¡EL AVE FÉNIX RESURGE! +${bonus} pts sumados a ${eff.sourceTeamName} (Total x3 = ${
                          num * 3
                        } pts).`
                      );
                    }
                  }}
                  className="px-2 py-1 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white rounded-lg font-black text-[10px] shadow"
                >
                  🔥 Triplicar x3
                </button>
              )}

              <button
                onClick={() => {
                  onReturnCardToTeam(eff.sourceTeamId, eff.cardId, { removeEffectId: eff.id });
                }}
                className="ml-1 px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-white text-[10px] font-bold rounded-lg flex items-center gap-1 active:scale-95 transition-all shadow"
                title="Anular efecto y devolver esta carta a la mano de su equipo"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Devolver</span>
              </button>

              <button
                onClick={() => onRemoveActiveEffect(eff.id)}
                className="ml-1 text-slate-500 hover:text-red-400 text-xs font-bold p-1 rounded"
                title="Quitar efecto sin devolver carta"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
