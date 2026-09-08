import { Team } from './types';
import { ActivePowerEffect } from './powerCards';

export interface TeamCardImpact {
  cardId: string;
  cardName: string;
  cardEmoji: string;
  delta: number;
  explanation: string;
}

export interface TeamVerdictResult {
  teamId: string;
  teamName: string;
  teamIndex: number;
  colorHex: string;
  rank: number;
  hits: number;
  basePoints: number;
  cardImpacts: TeamCardImpact[];
  totalCardDelta: number;
  finalPoints: number;
}

export interface TestVerdictCalculation {
  gameId: string;
  gameTitle: string;
  results: TeamVerdictResult[];
  consumedEffectIds: string[];
}

/**
 * Puntos base por ranking en la escala homologada del Game Show (Opción 1: Podio 5/3/2/1)
 */
export function getBasePointsForRank(rank: number, isBingo = false): number {
  if (isBingo) {
    if (rank === 1) return 6; // BINGO
    if (rank === 2) return 2; // Línea
    return 0;
  }

  switch (rank) {
    case 1:
      return 5;
    case 2:
      return 3;
    case 3:
      return 2;
    default:
      return 1;
  }
}

/**
 * Motor de cálculo automático de veredicto de prueba con resolución integral de Cartas de Poder
 */
export function calculateTestVerdict(params: {
  gameId: string;
  gameTitle: string;
  teams: Team[];
  roundHits?: Record<string, number>;
  manualRanks?: Record<string, number>;
  activeEffects: ActivePowerEffect[];
}): TestVerdictCalculation {
  const { gameId, gameTitle, teams, roundHits = {}, manualRanks = {}, activeEffects } = params;
  const isBingo = gameId === 'bingo';

  // 1. Determinar puestos (Ranks)
  // Si se proporcionaron puestos manuales, usarlos; de lo contrario, ordenar por aciertos de la ronda
  const sortedTeams = [...teams].sort((a, b) => {
    if (manualRanks[a.id] !== undefined && manualRanks[b.id] !== undefined) {
      return manualRanks[a.id] - manualRanks[b.id];
    }
    const hitsA = roundHits[a.id] || 0;
    const hitsB = roundHits[b.id] || 0;
    if (hitsB !== hitsA) return hitsB - hitsA;
    return b.score - a.score;
  });

  const teamRanks: Record<string, number> = {};
  sortedTeams.forEach((t, idx) => {
    teamRanks[t.id] = manualRanks[t.id] !== undefined ? manualRanks[t.id] : idx + 1;
  });

  // 2. Asignar puntos base por posición
  const basePointsMap: Record<string, number> = {};
  const impactsMap: Record<string, TeamCardImpact[]> = {};
  teams.forEach((t) => {
    basePointsMap[t.id] = getBasePointsForRank(teamRanks[t.id] || 4, isBingo);
    impactsMap[t.id] = [];
  });

  const consumedEffectIds: string[] = [];

  // Encontrar el equipo en 1.er puesto
  const winnerTeam = teams.find((t) => teamRanks[t.id] === 1);

  // 3. Evaluar cada efecto activo de carta
  for (const eff of activeEffects) {
    const sourceTeam = teams.find((t) => t.id === eff.sourceTeamId);
    const targetTeam = eff.targetTeamId ? teams.find((t) => t.id === eff.targetTeamId) : undefined;
    const sourceRank = sourceTeam ? teamRanks[sourceTeam.id] || 99 : 99;
    const targetRank = targetTeam ? teamRanks[targetTeam.id] || 99 : 99;

    switch (eff.cardId) {
      // 💰 DOBLE (x2 puntos positivos obtenidos en la prueba)
      case 'doble': {
        if (sourceTeam) {
          const base = basePointsMap[sourceTeam.id] || 0;
          if (base > 0) {
            impactsMap[sourceTeam.id].push({
              cardId: eff.cardId,
              cardName: 'Doble',
              cardEmoji: '💰',
              delta: base,
              explanation: `Duplica puntos de la prueba (+${base} pts adicionales)`,
            });
            consumedEffectIds.push(eff.id);
          }
        }
        break;
      }

      // 🔥 EL AVE FÉNIX (x3 puntos obtenidos en la prueba)
      case 'ave_fenix': {
        if (sourceTeam) {
          const base = basePointsMap[sourceTeam.id] || 0;
          if (base > 0) {
            const extra = base * 2;
            impactsMap[sourceTeam.id].push({
              cardId: eff.cardId,
              cardName: 'El Ave Fénix',
              cardEmoji: '🔥',
              delta: extra,
              explanation: `Triplica puntos (Total x3 = +${base + extra} pts)`,
            });
            consumedEffectIds.push(eff.id);
          }
        }
        break;
      }

      // 🎰 RULETA RUSA (1º/2º puesto: +6 pts / 3º-5º puesto: -4 pts)
      case 'ruleta_rusa': {
        if (sourceTeam) {
          if (sourceRank <= 2) {
            impactsMap[sourceTeam.id].push({
              cardId: eff.cardId,
              cardName: 'Ruleta Rusa',
              cardEmoji: '🎰',
              delta: 6,
              explanation: `Victoria en 1.º/2.º puesto (+6 pts extra)`,
            });
          } else {
            impactsMap[sourceTeam.id].push({
              cardId: eff.cardId,
              cardName: 'Ruleta Rusa',
              cardEmoji: '🎰',
              delta: -4,
              explanation: `Fallo en 3.º o peor (−4 pts de penalización)`,
            });
          }
          consumedEffectIds.push(eff.id);
        }
        break;
      }

      // 💣 BOMBA (-3 pts si el rival queda por debajo del atacante)
      case 'bomba': {
        if (sourceTeam && targetTeam) {
          if (targetRank > sourceRank) {
            impactsMap[targetTeam.id].push({
              cardId: eff.cardId,
              cardName: 'Bomba',
              cardEmoji: '💣',
              delta: -3,
              explanation: `Detonada por ${sourceTeam.name} al superarte (−3 pts)`,
            });
          }
          consumedEffectIds.push(eff.id);
        }
        break;
      }

      // 💀 LA SENTENCIA (-4 pts si el rival queda por debajo)
      case 'la_sentencia': {
        if (sourceTeam && targetTeam) {
          if (targetRank > sourceRank) {
            impactsMap[targetTeam.id].push({
              cardId: eff.cardId,
              cardName: 'La Sentencia',
              cardEmoji: '💀',
              delta: -4,
              explanation: `Ejecutada por ${sourceTeam.name} (−4 pts)`,
            });
          }
          consumedEffectIds.push(eff.id);
        }
        break;
      }

      // 👑 CAZA AL LÍDER (Roba 3 pts si superas al líder)
      case 'caza_lider': {
        if (sourceTeam) {
          // El líder objetivo es el que iba primero en la general o targetTeam
          const leader = targetTeam || [...teams].sort((a, b) => b.score - a.score)[0];
          if (leader && leader.id !== sourceTeam.id) {
            const leaderRank = teamRanks[leader.id] || 99;
            if (sourceRank < leaderRank) {
              impactsMap[sourceTeam.id].push({
                cardId: eff.cardId,
                cardName: 'Caza al Líder',
                cardEmoji: '👑',
                delta: 3,
                explanation: `Robas 3 pts a ${leader.name} al superarlo`,
              });
              impactsMap[leader.id].push({
                cardId: eff.cardId,
                cardName: 'Caza al Líder',
                cardEmoji: '👑',
                delta: -3,
                explanation: `Puntos robados por ${sourceTeam.name} (−3 pts)`,
              });
            }
          }
          consumedEffectIds.push(eff.id);
        }
        break;
      }

      // 🎯 OBJETIVO (+2 pts si el rival elegido no queda en 1.er puesto)
      case 'objetivo': {
        if (sourceTeam) {
          if (targetRank > 1) {
            impactsMap[sourceTeam.id].push({
              cardId: eff.cardId,
              cardName: 'Objetivo',
              cardEmoji: '🎯',
              delta: 2,
              explanation: `Objetivo cumplido: rival no quedó 1.º (+2 pts)`,
            });
          }
          consumedEffectIds.push(eff.id);
        }
        break;
      }

      // 🎩 EL IMPUESTO DEL PADRINO (50% de los puntos del 1.er puesto al equipo del Padrino)
      case 'impuesto_padrino': {
        if (sourceTeam && winnerTeam && winnerTeam.id !== sourceTeam.id) {
          const winnerBase = basePointsMap[winnerTeam.id] || 0;
          const tax = Math.max(1, Math.round(winnerBase * 0.5));
          impactsMap[sourceTeam.id].push({
            cardId: eff.cardId,
            cardName: 'El Impuesto del Padrino',
            cardEmoji: '🎩',
            delta: tax,
            explanation: `Comisión del 50% cobrada a ${winnerTeam.name} (+${tax} pts)`,
          });
          impactsMap[winnerTeam.id].push({
            cardId: eff.cardId,
            cardName: 'El Impuesto del Padrino',
            cardEmoji: '🎩',
            delta: -tax,
            explanation: `Comisión obligatoria entregada a ${sourceTeam.name} (−${tax} pts)`,
          });
          consumedEffectIds.push(eff.id);
        }
        break;
      }

      // 👑 EL ROBO DEL SIGLO (50% de los puntos del rival objetivo)
      case 'robo_siglo': {
        if (sourceTeam && targetTeam) {
          const targetBase = basePointsMap[targetTeam.id] || 0;
          if (targetBase > 0) {
            const steal = Math.max(1, Math.round(targetBase * 0.5));
            impactsMap[sourceTeam.id].push({
              cardId: eff.cardId,
              cardName: 'El Robo del Siglo',
              cardEmoji: '👑',
              delta: steal,
              explanation: `Robo del 50% de los puntos de ${targetTeam.name} (+${steal} pts)`,
            });
            impactsMap[targetTeam.id].push({
              cardId: eff.cardId,
              cardName: 'El Robo del Siglo',
              cardEmoji: '👑',
              delta: -steal,
              explanation: `Robado por ${sourceTeam.name} (−${steal} pts)`,
            });
          }
          consumedEffectIds.push(eff.id);
        }
        break;
      }

      // 💥 EL GOLPE MAESTRO (Si ganas 1.º, cada rival te transfiere 1 punto)
      case 'golpe_maestro': {
        if (sourceTeam && sourceRank === 1) {
          let totalStolen = 0;
          teams.forEach((rival) => {
            if (rival.id !== sourceTeam.id && rival.score > 0) {
              totalStolen += 1;
              impactsMap[rival.id].push({
                cardId: eff.cardId,
                cardName: 'El Golpe Maestro',
                cardEmoji: '💥',
                delta: -1,
                explanation: `Transferencia obligatoria al campeón ${sourceTeam.name} (−1 pt)`,
              });
            }
          });
          if (totalStolen > 0) {
            impactsMap[sourceTeam.id].push({
              cardId: eff.cardId,
              cardName: 'El Golpe Maestro',
              cardEmoji: '💥',
              delta: totalStolen,
              explanation: `Bote recolectado de los rivales (+${totalStolen} pts)`,
            });
          }
          consumedEffectIds.push(eff.id);
        }
        break;
      }

      // Escudos y limitaciones sensoriales se consumen al finalizar la prueba
      case 'escudo':
      case 'el_cuarto_mono':
      case 'titiritero':
      case 'cambio_forzoso':
      case 'baneo': {
        consumedEffectIds.push(eff.id);
        break;
      }

      default:
        break;
    }
  }

  // 4. Compilar los resultados finales por equipo
  const results: TeamVerdictResult[] = sortedTeams.map((t) => {
    const rank = teamRanks[t.id] || 4;
    const hits = roundHits[t.id] || 0;
    const base = basePointsMap[t.id] || 0;
    const impacts = impactsMap[t.id] || [];
    const cardDelta = impacts.reduce((acc, curr) => acc + curr.delta, 0);
    const finalPoints = Math.max(0, base + cardDelta);

    return {
      teamId: t.id,
      teamName: t.name,
      teamIndex: t.team_index,
      colorHex: t.color_hex,
      rank,
      hits,
      basePoints: base,
      cardImpacts: impacts,
      totalCardDelta: cardDelta,
      finalPoints,
    };
  });

  return {
    gameId,
    gameTitle,
    results,
    consumedEffectIds,
  };
}
