import React, { useState, useEffect, useMemo } from 'react';
import { RotateCcw, Maximize2, Minimize2, Smartphone, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { BingoTicket, generateBingoTicket, checkLineStatus, checkBingoStatus } from '../../lib/bingoTicketGenerator';
import { PlayerBingoTicketCard } from './PlayerBingoTicketCard';
import { getBingoBallTheme, BINGO_NICKNAMES } from '../../lib/bingoUtils';
import { Player } from '../../lib/types';
import { TeamCatalogItem } from '../../lib/constants';
import { RoomSync } from '../../lib/roomSync';
import { soundFX } from '../../lib/audio';
import { playerHaptics } from '../../lib/playerHaptics';

interface PlayerBingoSectionProps {
  bingoIsSpinning: boolean;
  bingoCurrentBall: number | null;
  bingoDrawnBalls: number[];
  lineAwarded?: boolean;
  bingoAwarded?: boolean;
  player?: Player | null;
  selectedTeam?: TeamCatalogItem | null;
  roomCode: string;
  roomSync: RoomSync;
}

export const PlayerBingoSection: React.FC<PlayerBingoSectionProps> = ({
  bingoIsSpinning,
  bingoCurrentBall,
  bingoDrawnBalls,
  lineAwarded = false,
  bingoAwarded = false,
  player,
  selectedTeam,
  roomCode,
  roomSync,
}) => {
  const playerId = player?.id || 'guest';

  // Estados locales sincronizados de Línea y Bingo validados
  const [localLineAwarded, setLocalLineAwarded] = useState(lineAwarded);
  const [localBingoAwarded, setLocalBingoAwarded] = useState(bingoAwarded);

  useEffect(() => {
    setLocalLineAwarded(lineAwarded);
  }, [lineAwarded]);

  useEffect(() => {
    setLocalBingoAwarded(bingoAwarded);
  }, [bingoAwarded]);

  // 1. Detección de Soporte de Fullscreen API
  const isFullscreenApiSupported = useMemo(() => {
    if (typeof document === 'undefined') return false;
    return !!(
      document.fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled ||
      (document.documentElement as any).requestFullscreen ||
      (document.documentElement as any).webkitRequestFullscreen
    );
  }, []);

  // 2. Estados de Orientación y Pantalla Completa
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight > window.innerWidth;
    }
    return false;
  });

  const [isFullscreen, setIsFullscreen] = useState(() => {
    if (typeof document !== 'undefined') {
      return !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
    }
    return false;
  });

  // Para dispositivos que no soporten Fullscreen API (como Safari en iPhone), se permite entrar manualmente en landscape
  const [manualLandscapeEntered, setManualLandscapeEntered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);

      const inFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(inFs);

      // Si se rota a vertical, nunca se permite ver el cartón
      if (portrait) {
        setManualLandscapeEntered(false);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    document.addEventListener('fullscreenchange', handleResize);
    document.addEventListener('webkitfullscreenchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      document.removeEventListener('fullscreenchange', handleResize);
      document.removeEventListener('webkitfullscreenchange', handleResize);
    };
  }, []);

  const handleRequestFullscreen = async () => {
    try {
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
      setManualLandscapeEntered(true);
    } catch {
      // Si falla o no está soportado (iOS Safari), permitir la entrada si está en apaisado
      setManualLandscapeEntered(true);
    }
  };

  const handleExitFullscreen = async () => {
    try {
      const doc = document as any;
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      }
    } catch {}
    setIsFullscreen(false);
    setManualLandscapeEntered(false);
  };

  // 3. Persistencia de UN ÚNICO CARTÓN inmutable por jugador
  const [ticket] = useState<BingoTicket>(() => {
    const saved = localStorage.getItem(`party_bingo_ticket_${roomCode}_${playerId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    const newTicket = generateBingoTicket();
    localStorage.setItem(`party_bingo_ticket_${roomCode}_${playerId}`, JSON.stringify(newTicket));
    return newTicket;
  });

  // 4. Persistencia de Números Marcados en el cartón
  const [marked, setMarked] = useState<number[]>(() => {
    const saved = localStorage.getItem(`party_bingo_marked_${roomCode}_${playerId}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(`party_bingo_marked_${roomCode}_${playerId}`, JSON.stringify(marked));
  }, [marked, roomCode, playerId]);

  const markedSet = useMemo(() => new Set(marked), [marked]);

  const handleToggleNumber = (num: number) => {
    setMarked((prev) => (prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]));
  };

  const handleResetMarks = () => {
    if (window.confirm('¿Desmarcar todos los números de tu cartón?')) {
      setMarked([]);
    }
  };

  // 5. Verificación de Estado de Línea y Bingo
  const lineStatus = useMemo(
    () => checkLineStatus(ticket, markedSet, bingoDrawnBalls),
    [ticket, markedSet, bingoDrawnBalls]
  );

  const bingoStatus = useMemo(
    () => checkBingoStatus(ticket, markedSet, bingoDrawnBalls),
    [ticket, markedSet, bingoDrawnBalls]
  );

  // Escuchar resolución de Línea y Bingo en tiempo real
  useEffect(() => {
    const unsubscribe = roomSync.onEvent((event) => {
      if (event.type === 'BINGO_STATE_UPDATE') {
        if (typeof event.payload.lineAwarded === 'boolean') {
          setLocalLineAwarded(event.payload.lineAwarded);
        }
        if (typeof event.payload.bingoAwarded === 'boolean') {
          setLocalBingoAwarded(event.payload.bingoAwarded);
        }
      } else if (event.type === 'BINGO_CLAIM_RESOLVE') {
        if (event.payload.accepted) {
          if (event.payload.claimType === 'line') {
            setLocalLineAwarded(true);
            setClaimModal((curr) => {
              if (curr?.type === 'line') {
                setClaimSentToast('ℹ️ La Línea ya ha sido validada y otorgada.');
                setTimeout(() => setClaimSentToast(null), 4000);
                return null;
              }
              return curr;
            });
          } else if (event.payload.claimType === 'bingo') {
            setLocalBingoAwarded(true);
            setClaimModal((curr) => {
              if (curr?.type === 'bingo') {
                setClaimSentToast('ℹ️ El Bingo ya ha sido validado y otorgado.');
                setTimeout(() => setClaimSentToast(null), 4000);
                return null;
              }
              return curr;
            });
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomSync]);

  // 6. Modal de Reclamación ("Cantar Línea" o "Cantar Bingo")
  const [claimModal, setClaimModal] = useState<{
    isOpen: boolean;
    type: 'line' | 'bingo';
    isValid: boolean;
    numbers: number[];
  } | null>(null);

  const [claimSentToast, setClaimSentToast] = useState<string | null>(null);

  const handleOpenClaimModal = (type: 'line' | 'bingo') => {
    if (type === 'line') {
      if (localLineAwarded) {
        setClaimSentToast('⚠️ La Línea ya ha sido cantada y validada en esta partida.');
        setTimeout(() => setClaimSentToast(null), 4000);
        return;
      }
      const isValid = lineStatus.hasValidDrawnLine;
      const lineNums = lineStatus.lineNumbers.length > 0 ? lineStatus.lineNumbers : marked.slice(0, 5);
      setClaimModal({ isOpen: true, type: 'line', isValid, numbers: lineNums });
    } else {
      if (localBingoAwarded) {
        setClaimSentToast('⚠️ El Bingo ya ha sido cantado y validado.');
        setTimeout(() => setClaimSentToast(null), 4000);
        return;
      }
      const isValid = bingoStatus.hasValidDrawnBingo;
      setClaimModal({
        isOpen: true,
        type: 'bingo',
        isValid,
        numbers: bingoStatus.allNumbers,
      });
    }
  };

  const handleConfirmClaim = () => {
    if (!claimModal) return;

    if (claimModal.type === 'line' && localLineAwarded) {
      setClaimSentToast('⚠️ La Línea ya ha sido cantada y validada.');
      setClaimModal(null);
      setTimeout(() => setClaimSentToast(null), 4000);
      return;
    }

    if (claimModal.type === 'bingo' && localBingoAwarded) {
      setClaimSentToast('⚠️ El Bingo ya ha sido cantado y validado.');
      setClaimModal(null);
      setTimeout(() => setClaimSentToast(null), 4000);
      return;
    }

    const payload = {
      claimType: claimModal.type,
      playerId,
      playerName: player?.nickname || 'Jugador',
      teamId: selectedTeam ? `team_${selectedTeam.index}` : player?.team_id || 'team_0',
      teamName: selectedTeam?.name || 'Equipo',
      teamColorHex: selectedTeam?.colorHex || '#d4af37',
      teamIndex: selectedTeam?.index ?? player?.team_index ?? 0,
      avatarSeed: player?.avatar_seed,
      avatarStyle: player?.avatar_style,
      cardIndex: 1,
      numbers: claimModal.numbers,
      timestamp: Date.now(),
    };

    roomSync.broadcast({
      type: 'BINGO_CLAIM',
      payload,
    });

    if (claimModal.type === 'line') {
      soundFX.playVictory();
      playerHaptics.lineClaim();
      setClaimSentToast('📢 ¡Has cantado LÍNEA! Notificado al Maestro de Ceremonias...');
    } else {
      soundFX.playVictory();
      playerHaptics.bingoClaim();
      setClaimSentToast('🎆 ¡¡HAS CANTADO BINGO!! Notificado a toda la sala...');
    }

    setClaimModal(null);
    setTimeout(() => setClaimSentToast(null), 6000);
  };

  // =========================================================================
  // REGLA CRÍTICA DE VISUALIZACIÓN:
  // El cartón NUNCA sale en vertical.
  // Para ver el cartón, debe estar en horizontal (landscape) Y en pantalla completa
  // (o haber pulsado entrar en dispositivos sin Fullscreen API como iPhone).
  // Si sale de pantalla completa, vuelve de inmediato a la pantalla inicial.
  // =========================================================================
  const canShowTicket =
    !isPortrait && (isFullscreen || (!isFullscreenApiSupported && manualLandscapeEntered));

  // =========================================================================
  // PANTALLA INICIAL: GIRO Y PANTALLA COMPLETA REQUERIDOS
  // =========================================================================
  if (!canShowTicket) {
    return (
      <div className="my-auto w-full max-w-sm space-y-4 text-center px-2 py-3 select-none">
        <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/70 rounded-3xl p-6 shadow-deco-gold backdrop-blur-xl hell-card-frame">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold-gradient text-slate-950 text-[11px] font-broadway font-black uppercase tracking-wider border border-[#f5eedb]/40 shadow-sm mb-3">
            <span>🎱</span> SALÓN DE BINGO ART DÉCO
          </div>

          <div className="my-3 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-deco-gold border-2 border-[#f5eedb] animate-bounce-short">
              <Smartphone className="w-10 h-10 text-slate-950 rotate-90" />
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-amber-300 font-broadway text-xs uppercase tracking-widest">
              <RotateCcw className="w-4 h-4 animate-spin text-amber-400" />
              <span>Gira tu móvil a horizontal</span>
            </div>
          </div>

          <h3 className="text-xl font-broadway uppercase text-gold-gradient mb-1">
            Tu Cartón de Juego
          </h3>

          <p className="text-xs font-vintage text-amber-100/80 leading-relaxed mb-4">
            El cartón oficial de 90 bolas (3×9) requiere <strong>orientación horizontal</strong> y <strong>pantalla completa</strong> para asegurar máxima legibilidad táctil sin recortes del navegador.
          </p>

          {/* RESUMEN DE LA BOLA ACTUAL DEL BOMBO */}
          <div className="bg-[#07070a] border border-[#d4af37]/35 rounded-2xl p-3 mb-5 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] uppercase font-broadway text-amber-300/80 block">
                Última Bola del Bombo
              </span>
              <span className="text-sm font-broadway text-gold-gradient">
                {bingoIsSpinning
                  ? '¡Girando ruleta!'
                  : bingoCurrentBall
                  ? `Bola ${bingoCurrentBall}`
                  : 'Esperando extracción'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-vintage text-amber-200/60 block">Extraídas</span>
              <span className="text-xs font-broadway text-white">
                {bingoDrawnBalls.length} / 90
              </span>
            </div>
          </div>

          {/* BOTÓN DE ACCESO PRINCIPAL */}
          <button
            onClick={() => {
              handleRequestFullscreen();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gold-gradient hover:brightness-110 text-slate-950 font-broadway font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-deco-gold active:scale-95 transition-all"
          >
            <Maximize2 className="w-4 h-4" />
            <span>
              {isPortrait
                ? 'Gira en Horizontal y Entra en Pantalla Completa'
                : 'Entrar al Cartón en Pantalla Completa'}
            </span>
          </button>

          {isPortrait && (
            <p className="text-[10px] font-vintage text-amber-300/60 mt-3 italic">
              * Recuerda desactivar el bloqueo de rotación de tu móvil si no gira automáticamente.
            </p>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VISTA ACTIVA DEL CARTÓN EN HORIZONTAL + PANTALLA COMPLETA
  // =========================================================================
  return (
    <div className="fixed inset-0 z-40 w-full h-full max-h-[100dvh] flex flex-row items-stretch justify-between p-1.5 sm:p-2.5 gap-2 bg-[#06060c] select-none overflow-hidden">
      {/* TOAST DE CONFIRMACIÓN DE CANTO */}
      {claimSentToast && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gold-gradient text-slate-950 font-broadway font-black text-xs rounded-2xl shadow-deco-gold border border-[#f5eedb] animate-bounce-short text-center">
          {claimSentToast}
        </div>
      )}

      {/* COLUMNA LATERAL IZQUIERDA: BOLA ACTUAL, ACCIONES DE CANTO Y SALIR (~125px - 150px) */}
      <div className="w-[125px] sm:w-[150px] flex-shrink-0 flex flex-col justify-between bg-[#0a0a14]/95 border-2 border-[#d4af37]/60 rounded-2xl sm:rounded-3xl p-2 shadow-deco-gold backdrop-blur-xl hell-card-frame">
        {/* CABECERA: BOLA EN TIEMPO REAL */}
        <div className="flex flex-col items-center text-center">
          <div className="text-[9px] sm:text-[10px] uppercase font-broadway tracking-wider text-amber-300/80 mb-1">
            {bingoIsSpinning ? 'Ruleta...' : 'Última Bola'}
          </div>

          <div className="flex items-center justify-center">
            {bingoIsSpinning ? (
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gold-gradient flex items-center justify-center animate-spin shadow-deco-gold border-2 border-[#f5eedb]">
                <span className="text-base sm:text-xl">🎱</span>
              </div>
            ) : bingoCurrentBall ? (
              (() => {
                const theme = getBingoBallTheme(bingoCurrentBall);
                return (
                  <div
                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center border-2 shadow-deco-gold font-broadway text-xl sm:text-2xl ${theme.bgGradient} ${theme.border} ${theme.ballTextClass} animate-bounce-short`}
                  >
                    {bingoCurrentBall}
                  </div>
                );
              })()
            ) : (
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#12121c] border border-dashed border-[#d4af37]/40 flex items-center justify-center text-amber-400/50 text-xs">
                —
              </div>
            )}
          </div>

          {/* CONTADOR DE BOLAS */}
          <div className="mt-1 text-[9px] sm:text-[10px] font-broadway text-amber-200/80">
            <span className="text-gold-gradient font-black">{bingoDrawnBalls.length}</span>
            <span className="text-amber-200/50">/90</span>
          </div>
        </div>

        {/* ACCIONES DE CANTO: LÍNEA Y BINGO */}
        <div className="space-y-1.5 my-auto">
          <button
            onClick={() => handleOpenClaimModal('line')}
            disabled={localLineAwarded}
            className={`w-full py-2 sm:py-2.5 px-1 rounded-xl text-[10px] sm:text-xs font-broadway font-black uppercase tracking-wider flex items-center justify-center gap-1 border shadow-sm transition-all ${
              localLineAwarded
                ? 'bg-[#101018] text-slate-500 border-slate-800/80 cursor-not-allowed opacity-60 line-through'
                : lineStatus.hasValidDrawnLine
                ? 'bg-amber-400 text-slate-950 border-white ring-2 ring-amber-300 animate-pulse shadow-deco-gold active:scale-95'
                : 'bg-[#161622] hover:bg-[#1e1e2e] text-amber-200 border-[#d4af37]/40 active:scale-95'
            }`}
            title={localLineAwarded ? 'La línea ya ha sido cantada y otorgada' : undefined}
          >
            <span>{localLineAwarded ? '🔒 Línea Validada' : '📏 Línea'}</span>
            {!localLineAwarded && lineStatus.hasValidDrawnLine && <span>✨</span>}
          </button>

          <button
            onClick={() => handleOpenClaimModal('bingo')}
            disabled={localBingoAwarded}
            className={`w-full py-2 sm:py-2.5 px-1 rounded-xl text-[10px] sm:text-xs font-broadway font-black uppercase tracking-wider flex items-center justify-center gap-1 border shadow-deco-gold transition-all ${
              localBingoAwarded
                ? 'bg-[#101018] text-slate-500 border-slate-800/80 cursor-not-allowed opacity-60 line-through'
                : bingoStatus.hasValidDrawnBingo
                ? 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-slate-950 border-white ring-4 ring-yellow-400 animate-pulse active:scale-95'
                : 'bg-gold-gradient hover:brightness-110 text-slate-950 border-[#f5eedb]/50 active:scale-95'
            }`}
            title={localBingoAwarded ? 'El bingo ya ha sido cantado y otorgado' : undefined}
          >
            <span>{localBingoAwarded ? '🏆 Bingo Validado' : '🎱 BINGO'}</span>
            {!localBingoAwarded && bingoStatus.hasValidDrawnBingo && <span>🎆</span>}
          </button>
        </div>

        {/* BOTÓN PARA SALIR DE PANTALLA COMPLETA */}
        <button
          onClick={handleExitFullscreen}
          className="w-full py-1 text-[9px] font-vintage text-amber-300/70 hover:text-amber-200 flex items-center justify-center gap-1 border border-[#d4af37]/25 rounded-lg bg-[#101018]"
          title="Salir de pantalla completa y volver"
        >
          <Minimize2 className="w-3 h-3" />
          <span>Salir</span>
        </button>
      </div>

      {/* ÁREA PRINCIPAL DERECHA: BARRA SUPERIOR + CARTÓN ÚNICO 3x9 */}
      <div className="flex-1 flex flex-col justify-between h-full overflow-hidden">
        {/* BARRA SUPERIOR CON ESTADO Y DESMARCAR */}
        <div className="flex items-center justify-between px-2.5 py-1 bg-[#0a0a14]/90 border border-[#d4af37]/40 rounded-xl mb-1 text-[10px] sm:text-xs font-vintage">
          <div className="flex items-center gap-2">
            <span className="font-broadway text-amber-300 uppercase tracking-wider">
              Tu Cartón Oficial
            </span>
            <span className="text-amber-200/60">•</span>
            <span className="text-amber-100/80">
              Tachados: <strong className="text-gold-gradient font-bold">{marked.length} / 15</strong>
            </span>
          </div>

          <button
            onClick={handleResetMarks}
            className="text-amber-300/70 hover:text-amber-200 underline text-[10px] sm:text-xs font-vintage"
          >
            Desmarcar todo
          </button>
        </div>

        {/* CUADRÍCULA 3x9 DEL CARTÓN */}
        <div className="flex-1 w-full h-full flex items-center justify-center">
          <PlayerBingoTicketCard
            ticket={ticket}
            markedNumbers={markedSet}
            drawnBalls={bingoDrawnBalls}
            onToggleNumber={handleToggleNumber}
            teamColorHex={selectedTeam?.colorHex}
          />
        </div>
      </div>

      {/* =========================================================================
          MODAL DE CONFIRMACIÓN DE CANTO (LÍNEA O BINGO)
          ========================================================================= */}
      {claimModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
          <div className="bg-[#0c0c16] border-2 border-[#d4af37] rounded-3xl p-5 max-w-sm w-full shadow-deco-gold text-center hell-card-frame animate-bounce-short">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gold-gradient text-slate-950 font-broadway font-black text-xs uppercase mb-3 shadow-sm">
              {claimModal.type === 'line' ? '📏 CANTAR LÍNEA' : '🎱 ¡CANTAR BINGO!'}
            </div>

            <h3 className="text-lg font-broadway uppercase text-gold-gradient mb-2">
              {claimModal.isValid
                ? `¡Tu ${claimModal.type === 'line' ? 'Línea' : 'Bingo'} parece válida!`
                : `Aún no han salido todos los números`}
            </h3>

            <p className="text-xs font-vintage text-amber-100/80 mb-4 leading-relaxed">
              {claimModal.isValid
                ? `Todos los números requeridos han sido extraídos del bombo. Al confirmar, se notificará al Maestro de Ceremonias y a la TV.`
                : `Atención: Faltan números por salir del bombo para completar tu ${claimModal.type}. ¿Deseas cantar igualmente?`}
            </p>

            {/* LISTA DE NÚMEROS */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#07070a] border border-[#d4af37]/30 mb-5">
              {claimModal.numbers.map((num) => {
                const isDrawn = bingoDrawnBalls.includes(num);
                return (
                  <span
                    key={num}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-broadway font-black border ${
                      isDrawn
                        ? 'bg-emerald-600 text-white border-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-rose-950/80 text-rose-300 border-rose-600/50'
                    }`}
                  >
                    {num}
                  </span>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setClaimModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#14141e] hover:bg-[#1a1a28] text-amber-200 border border-[#d4af37]/30 text-xs font-vintage font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmClaim}
                className="flex-1 py-2.5 rounded-xl bg-gold-gradient hover:brightness-110 text-slate-950 font-broadway font-black text-xs uppercase shadow-deco-gold"
              >
                ¡Cantar al Salón!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
