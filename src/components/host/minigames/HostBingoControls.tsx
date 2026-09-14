import React from 'react';
import { Loader2, AlertCircle, CheckCircle2, XCircle, BellRing } from 'lucide-react';
import { getBingoBallTheme, BINGO_NICKNAMES } from '../../../lib/bingoUtils';
import { Team, BingoClaimPayload } from '../../../lib/types';
import { TEAMS_CATALOG } from '../../../lib/constants';

export interface HostBingoControlsProps {
  bingoDrawnBalls: number[];
  bingoCurrentBall: number | null;
  bingoIsSpinning: boolean;
  onResetBingo: () => void;
  onDrawBingoBall: () => void;
  teams: Team[];
  selectedTeamCatalog?: (typeof TEAMS_CATALOG)[0] | null;
  onScoreChange: (teamId: string, delta: number) => void;
  pendingClaims?: BingoClaimPayload[];
  activeClaim?: BingoClaimPayload | null;
  lineAwarded?: boolean;
  bingoAwarded?: boolean;
  lineWinner?: { playerName: string; teamName: string } | null;
  bingoWinner?: { playerName: string; teamName: string } | null;
  onResolveClaim?: (claim: BingoClaimPayload, accepted: boolean) => void;
  onDismissClaim?: () => void;
}

export const HostBingoControls: React.FC<HostBingoControlsProps> = ({
  bingoDrawnBalls,
  bingoCurrentBall,
  bingoIsSpinning,
  onResetBingo,
  onDrawBingoBall,
  teams,
  selectedTeamCatalog,
  onScoreChange,
  pendingClaims = [],
  activeClaim,
  lineAwarded = false,
  bingoAwarded = false,
  lineWinner = null,
  bingoWinner = null,
  onResolveClaim,
  onDismissClaim,
}) => {
  const isClaimAlreadyAwarded =
    !!activeClaim &&
    ((activeClaim.claimType === 'line' && lineAwarded) ||
      (activeClaim.claimType === 'bingo' && bingoAwarded));

  return (
    <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/50 rounded-3xl p-6 shadow-deco-gold space-y-5 hell-card-frame">
      {/* =========================================================================
          PANEL DE ALERTA DE RECLAMACIÓN EN TIEMPO REAL (LÍNEA O BINGO CANTADO)
          ========================================================================= */}
      {activeClaim && (
        <div className="bg-[#140e06] border-2 border-amber-400 rounded-2xl p-4 shadow-deco-gold animate-bounce-short relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-amber-400/40 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gold-gradient text-slate-950 flex items-center justify-center font-bold text-base shadow-sm animate-pulse">
                🔔
              </span>
              <div>
                <span className="text-xs font-broadway uppercase tracking-wider text-amber-300 block">
                  ¡Canto Recibido desde el Móvil!
                </span>
                <span className="text-base font-broadway uppercase text-white">
                  {activeClaim.claimType === 'line' ? '📏 ¡LÍNEA CANTADA!' : '🎱 ¡¡BINGO CANTADO!!'}
                </span>
              </div>
            </div>

            {pendingClaims.length > 1 && (
              <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-broadway border border-amber-400/40">
                1 de {pendingClaims.length} pendientes
              </span>
            )}
          </div>

          {isClaimAlreadyAwarded && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-amber-950/80 border border-amber-500/60 text-amber-200 text-xs font-vintage flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Atención:</strong> Esta modalidad ({activeClaim.claimType === 'line' ? 'Línea' : 'Bingo'}) ya fue validada y otorgada previamente en esta partida. No puede volver a premiarse.
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-sm font-vintage text-amber-100">
                Jugador:{' '}
                <strong className="text-white font-broadway text-base">
                  {activeClaim.playerName}
                </strong>{' '}
                • Equipo:{' '}
                <span
                  className="font-broadway px-2 py-0.5 rounded text-xs text-slate-950"
                  style={{ backgroundColor: activeClaim.teamColorHex || '#d4af37' }}
                >
                  {activeClaim.teamName}
                </span>{' '}
                <span className="text-xs text-amber-300/70">
                  (Cartón #{activeClaim.cardIndex})
                </span>
              </div>
            </div>

            {/* VALIDACIÓN AUTOMÁTICA */}
            {(() => {
              const allMatch = activeClaim.numbers.every((n) => bingoDrawnBalls.includes(n));
              return (
                <div
                  className={`px-3 py-1 rounded-xl text-xs font-broadway uppercase tracking-wider flex items-center gap-1.5 border ${
                    allMatch
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                      : 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                  }`}
                >
                  {allMatch ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Comprobación: 100% Válida</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span>Faltan bolas por salir</span>
                    </>
                  )}
                </div>
              );
            })()}
          </div>

          {/* COTEJO DE NÚMEROS CANTADOS */}
          <div className="mb-4">
            <span className="text-[11px] font-vintage uppercase text-amber-300/80 block mb-1.5 font-bold">
              Números presentados por el jugador:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-[#07070a]/90 border border-[#d4af37]/30">
              {activeClaim.numbers.map((num) => {
                const isDrawn = bingoDrawnBalls.includes(num);
                return (
                  <div
                    key={num}
                    className={`px-2.5 py-1 rounded-lg text-xs font-broadway font-black flex items-center gap-1 border ${
                      isDrawn
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-rose-950 text-rose-300 border-rose-500 line-through opacity-80'
                    }`}
                  >
                    <span>{num}</span>
                    <span>{isDrawn ? '✓' : '✗'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BOTONES DE DECISIÓN DEL MC */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onResolveClaim?.(activeClaim, true)}
              disabled={isClaimAlreadyAwarded}
              className={`flex-1 py-3 px-4 rounded-xl font-broadway font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all ${
                isClaimAlreadyAwarded
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed opacity-50'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isClaimAlreadyAwarded
                  ? `${activeClaim.claimType === 'line' ? 'Línea' : 'Bingo'} Ya Otorgada`
                  : `Aceptar y Otorgar +${activeClaim.claimType === 'line' ? 2 : 6} pts`}
              </span>
            </button>

            <button
              onClick={() => onResolveClaim?.(activeClaim, false)}
              className="py-3 px-4 rounded-xl bg-[#1c1214] hover:bg-[#28181a] text-rose-300 border border-rose-600/40 font-vintage font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <XCircle className="w-4 h-4" />
              <span>Rechazar</span>
            </button>

            {onDismissClaim && (
              <button
                onClick={onDismissClaim}
                className="py-3 px-3 rounded-xl bg-transparent hover:bg-white/5 text-amber-200/50 text-xs font-vintage underline"
              >
                Posponer
              </button>
            )}
          </div>
        </div>
      )}

      {/* ESTADO DE LÍNEA Y BINGO DE LA PARTIDA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div
          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
            lineAwarded
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-[#101018] border-[#d4af37]/30 text-amber-200/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{lineAwarded ? '✅' : '📏'}</span>
            <div>
              <span className="text-[10px] uppercase font-broadway block tracking-wider">
                Premio de Línea (+2 pts)
              </span>
              <span className="text-xs font-broadway font-bold text-white">
                {lineAwarded
                  ? lineWinner
                    ? `Validada: ${lineWinner.playerName} (${lineWinner.teamName})`
                    : 'Validada y Premiada'
                  : 'Pendiente de cantar'}
              </span>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-broadway uppercase border ${
              lineAwarded
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'bg-amber-400/10 text-amber-300 border-amber-400/30'
            }`}
          >
            {lineAwarded ? 'Cerrada' : 'Disponible'}
          </span>
        </div>

        <div
          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
            bingoAwarded
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-[#101018] border-[#d4af37]/30 text-amber-200/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{bingoAwarded ? '🏆' : '🎱'}</span>
            <div>
              <span className="text-[10px] uppercase font-broadway block tracking-wider">
                Premio de Bingo (+6 pts)
              </span>
              <span className="text-xs font-broadway font-bold text-white">
                {bingoAwarded
                  ? bingoWinner
                    ? `¡Ganado por ${bingoWinner.playerName} (${bingoWinner.teamName})!`
                    : '¡Bingo Validado!'
                  : 'En juego'}
              </span>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-broadway uppercase border ${
              bingoAwarded
                ? 'bg-gold-gradient text-slate-950 border-[#f5eedb]/60 font-black'
                : 'bg-amber-400/10 text-amber-300 border-amber-400/30'
            }`}
          >
            {bingoAwarded ? 'Finalizado' : 'En juego'}
          </span>
        </div>
      </div>

      {/* CABECERA ESTÁNDAR */}
      <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎱</span>
          <span className="text-sm font-broadway uppercase tracking-wider text-gold-gradient">
            Bombo Virtual de BINGO (Bolas extraídas: {bingoDrawnBalls.length}/90)
          </span>
        </div>
        <button
          onClick={onResetBingo}
          className="px-2.5 py-1 bg-[#14141e] hover:bg-[#1a1a28] text-amber-200 rounded-xl text-xs font-vintage font-bold border border-[#d4af37]/30 shadow-sm"
        >
          Reiniciar Bombo
        </button>
      </div>

      {/* BOLA ACTUAL Y ACCIÓN DE SACAR BOLA CON RULETA */}
      <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
        <div className="flex items-center gap-4">
          {(() => {
            const theme = getBingoBallTheme(bingoCurrentBall);
            const nick = bingoCurrentBall ? BINGO_NICKNAMES[bingoCurrentBall] : null;
            return (
              <>
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-tr ${theme.bgGradient} border-2 ${theme.border} ${theme.ballTextClass} font-broadway text-3xl flex items-center justify-center shadow-deco-gold transition-all ${
                    bingoIsSpinning ? 'animate-spin' : ''
                  } ${theme.isLightColor ? 'ring-2 ring-slate-400' : ''}`}
                >
                  {bingoIsSpinning ? '?' : bingoCurrentBall || '—'}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-broadway text-amber-400 block">
                    {bingoIsSpinning ? 'Ruleta en marcha...' : 'Última Bola:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-broadway text-gold-gradient">
                      {bingoIsSpinning ? '¡Girando bombo!' : bingoCurrentBall ? `Bola ${bingoCurrentBall}` : 'Ninguna bola aún'}
                    </span>
                    {nick && !bingoIsSpinning && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-gold-gradient text-slate-950 font-broadway font-black text-[10px] uppercase shadow-sm">
                        {nick}
                      </span>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        <button
          onClick={onDrawBingoBall}
          disabled={bingoIsSpinning}
          className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl text-sm uppercase font-broadway font-black flex items-center justify-center gap-2 shadow-deco-gold active:scale-95 transition-all ${
            bingoIsSpinning
              ? 'bg-[#14141e] text-amber-200/40 cursor-not-allowed border border-[#d4af37]/20'
              : 'bg-gold-gradient hover:brightness-110 text-slate-950 border border-[#f5eedb]/50'
          }`}
        >
          {bingoIsSpinning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
              <span>Girando Ruleta...</span>
            </>
          ) : (
            <span>🎰 ¡Girar Ruleta y Sacar Bola!</span>
          )}
        </button>
      </div>

      {/* BOTONES DE PREMIO MANUAL / DIRECTO */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            const targetTeam = selectedTeamCatalog
              ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
              : teams.find((t) => t.is_active);
            if (targetTeam) {
              onScoreChange(targetTeam.id, 2);
            } else {
              alert('Selecciona un equipo primero para cantar Línea');
            }
          }}
          className="flex-1 px-4 py-3 bg-[#14141e] hover:bg-[#1a1a28] text-amber-200 border border-[#d4af37]/40 rounded-2xl text-xs font-broadway font-black uppercase flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>📏 Cantar Línea Manual (+2 pts)</span>
        </button>
        <button
          onClick={() => {
            const targetTeam = selectedTeamCatalog
              ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
              : teams.find((t) => t.is_active);
            if (targetTeam) {
              onScoreChange(targetTeam.id, 6);
            } else {
              alert('Selecciona un equipo primero para cantar BINGO');
            }
          }}
          className="flex-1 px-4 py-3 bg-gold-gradient hover:brightness-110 text-slate-950 border border-[#f5eedb]/50 rounded-2xl text-xs font-broadway font-black uppercase flex items-center justify-center gap-1.5 shadow-deco-gold"
        >
          <span>🎱 ¡Cantar BINGO Manual! (+6 pts)</span>
        </button>
      </div>
    </div>
  );
};
