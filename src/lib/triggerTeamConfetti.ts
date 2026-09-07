import confetti from 'canvas-confetti';
import { getTeamTheme } from './teamThemes';

/**
 * Dispara cañones de confeti laterales con los colores oficiales del equipo vencedor.
 * @param teamIndexOrId Índice de equipo (1-8) o string ID (ej: 'team_1', 'team_2')
 */
export function triggerTeamConfetti(teamIndexOrId?: number | string) {
  let index = 1;
  if (typeof teamIndexOrId === 'number') {
    index = teamIndexOrId;
  } else if (typeof teamIndexOrId === 'string') {
    const match = teamIndexOrId.match(/\d+/);
    if (match) {
      index = parseInt(match[0], 10);
    }
  }

  const theme = getTeamTheme(index);
  const colors = theme?.confettiColors || ['#3B82F6', '#EF4444', '#EAB308', '#FFFFFF', '#94A3B8'];

  // 1. Cañón lateral izquierdo lanzado hacia el centro superior
  confetti({
    particleCount: 70,
    angle: 60,
    spread: 65,
    origin: { x: 0.05, y: 0.7 },
    colors,
    startVelocity: 55,
  });

  // 2. Cañón lateral derecho lanzado hacia el centro superior
  confetti({
    particleCount: 70,
    angle: 120,
    spread: 65,
    origin: { x: 0.95, y: 0.7 },
    colors,
    startVelocity: 55,
  });

  // 3. Ráfaga estelar central retardada
  setTimeout(() => {
    confetti({
      particleCount: 90,
      spread: 90,
      origin: { x: 0.5, y: 0.5 },
      colors,
      startVelocity: 40,
    });
  }, 220);
}
