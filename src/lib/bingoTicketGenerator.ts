/**
 * bingoTicketGenerator.ts
 * Generador algorítmico de cartones de Bingo tradicional de 90 bolas (estilo español).
 * 
 * Reglas matemáticas de un cartón válido de 90 bolas:
 * - Matriz de 3 filas × 9 columnas.
 * - Exactamente 15 números por cartón (5 números y 4 huecos vacíos por cada fila).
 * - Cada columna contiene entre 1 y 3 números.
 * - Columnas por decenas:
 *    Col 0: 1 - 9
 *    Col 1: 10 - 19
 *    Col 2: 20 - 29
 *    Col 3: 30 - 39
 *    Col 4: 40 - 49
 *    Col 5: 50 - 59
 *    Col 6: 60 - 69
 *    Col 7: 70 - 79
 *    Col 8: 80 - 90
 * - En cada columna, los números están ordenados ascendentemente de arriba a abajo.
 */

export type BingoTicket = (number | null)[][];

export interface BingoTicketPair {
  ticket1: BingoTicket;
  ticket2: BingoTicket;
}

const COLUMN_RANGES: [number, number][] = [
  [1, 9],    // Col 0
  [10, 19],  // Col 1
  [20, 29],  // Col 2
  [30, 39],  // Col 3
  [40, 49],  // Col 4
  [50, 59],  // Col 5
  [60, 69],  // Col 6
  [70, 79],  // Col 7
  [80, 90],  // Col 8
];

/**
 * Obtiene un subconjunto aleatorio sin repetición de números dentro de un rango
 */
function getRandomNumbersFromRange(min: number, max: number, count: number): number[] {
  const pool: number[] = [];
  for (let i = min; i <= max; i++) {
    pool.push(i);
  }
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(randomIndex, 1)[0]);
  }
  return result.sort((a, b) => a - b);
}

/**
 * Genera la máscara booleana 3x9 de huecos y números asegurando:
 * - 5 números por fila (exactamente 5 valores true en fila 0, 1 y 2).
 * - Cada columna tiene entre 1 y 3 números.
 * - Suma total de números = 15.
 */
function generateValidTicketLayout(): boolean[][] {
  for (let attempt = 0; attempt < 1000; attempt++) {
    // 1. Distribuir 15 números en 9 columnas (mínimo 1 por columna, máximo 3)
    const counts = [1, 1, 1, 1, 1, 1, 1, 1, 1]; // 9 números garantizados
    let remaining = 6; // Para llegar a 15

    while (remaining > 0) {
      const col = Math.floor(Math.random() * 9);
      if (counts[col] < 3) {
        counts[col]++;
        remaining--;
      }
    }

    // 2. Intentar asignar filas a cada columna respetando 5 números por fila
    const layout: boolean[][] = [
      new Array(9).fill(false),
      new Array(9).fill(false),
      new Array(9).fill(false),
    ];

    const rowCounts = [0, 0, 0];

    // Primero asignar columnas con 3 números (ocupan filas 0, 1 y 2)
    for (let c = 0; c < 9; c++) {
      if (counts[c] === 3) {
        layout[0][c] = true;
        layout[1][c] = true;
        layout[2][c] = true;
        rowCounts[0]++;
        rowCounts[1]++;
        rowCounts[2]++;
      }
    }

    // Resolver el resto de columnas usando backtracking ligero
    const remainingCols = Array.from({ length: 9 }, (_, i) => i).filter((c) => counts[c] < 3);

    function solve(index: number): boolean {
      if (index === remainingCols.length) {
        return rowCounts[0] === 5 && rowCounts[1] === 5 && rowCounts[2] === 5;
      }

      const col = remainingCols[index];
      const needed = counts[col]; // 1 o 2

      if (needed === 1) {
        const candidateRows = [0, 1, 2].filter((r) => rowCounts[r] < 5);
        // Desordenar candidatos para variabilidad
        candidateRows.sort(() => Math.random() - 0.5);

        for (const r of candidateRows) {
          layout[r][col] = true;
          rowCounts[r]++;
          if (solve(index + 1)) return true;
          layout[r][col] = false;
          rowCounts[r]--;
        }
      } else if (needed === 2) {
        const pairs: [number, number][] = [
          [0, 1],
          [0, 2],
          [1, 2],
        ].filter(([r1, r2]) => rowCounts[r1] < 5 && rowCounts[r2] < 5) as [number, number][];

        pairs.sort(() => Math.random() - 0.5);

        for (const [r1, r2] of pairs) {
          layout[r1][col] = true;
          layout[r2][col] = true;
          rowCounts[r1]++;
          rowCounts[r2]++;
          if (solve(index + 1)) return true;
          layout[r1][col] = false;
          layout[r2][col] = false;
          rowCounts[r1]--;
          rowCounts[r2]--;
        }
      }

      return false;
    }

    if (solve(0)) {
      return layout;
    }
  }

  // Fallback garantizado por si excede los intentos
  return [
    [true, true, true, true, true, false, false, false, false],
    [false, false, false, false, true, true, true, true, true],
    [true, false, true, false, false, true, false, true, true],
  ];
}

/**
 * Genera un cartón de Bingo válido de 90 bolas con números reales ordenados por columna.
 */
export function generateBingoTicket(): BingoTicket {
  const layout = generateValidTicketLayout();
  const ticket: BingoTicket = [
    new Array(9).fill(null),
    new Array(9).fill(null),
    new Array(9).fill(null),
  ];

  for (let c = 0; c < 9; c++) {
    const activeRows: number[] = [];
    for (let r = 0; r < 3; r++) {
      if (layout[r][c]) activeRows.push(r);
    }

    const [minVal, maxVal] = COLUMN_RANGES[c];
    const drawnNumbers = getRandomNumbersFromRange(minVal, maxVal, activeRows.length);

    activeRows.forEach((r, idx) => {
      ticket[r][c] = drawnNumbers[idx];
    });
  }

  return ticket;
}

/**
 * Genera un par de cartones de Bingo diferentes
 */
export function generateTicketPair(): BingoTicketPair {
  return {
    ticket1: generateBingoTicket(),
    ticket2: generateBingoTicket(),
  };
}

/**
 * Extrae todos los números no nulos de un cartón (exactamente 15)
 */
export function getAllTicketNumbers(ticket: BingoTicket): number[] {
  const nums: number[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 9; c++) {
      const val = ticket[r][c];
      if (val !== null) nums.push(val);
    }
  }
  return nums;
}

/**
 * Verifica si el cartón tiene alguna línea completada (los 5 números de una fila tachados).
 * Opcionalmente verifica si todos ellos ya han salido en el bombo de la TV (`drawnBalls`).
 */
export function checkLineStatus(
  ticket: BingoTicket,
  markedNumbers: Set<number>,
  drawnBalls?: number[]
): {
  hasMarkedLine: boolean;
  hasValidDrawnLine: boolean;
  completedRowIndex: number | null;
  lineNumbers: number[];
} {
  for (let r = 0; r < 3; r++) {
    const rowNums = ticket[r].filter((val): val is number => val !== null);
    const allMarked = rowNums.every((num) => markedNumbers.has(num));

    if (allMarked && rowNums.length === 5) {
      const allDrawn = drawnBalls ? rowNums.every((num) => drawnBalls.includes(num)) : true;
      return {
        hasMarkedLine: true,
        hasValidDrawnLine: allDrawn,
        completedRowIndex: r,
        lineNumbers: rowNums,
      };
    }
  }

  return {
    hasMarkedLine: false,
    hasValidDrawnLine: false,
    completedRowIndex: null,
    lineNumbers: [],
  };
}

/**
 * Verifica si el cartón tiene BINGO completado (los 15 números tachados).
 * Opcionalmente verifica si todos ellos ya han salido en el bombo de la TV (`drawnBalls`).
 */
export function checkBingoStatus(
  ticket: BingoTicket,
  markedNumbers: Set<number>,
  drawnBalls?: number[]
): {
  hasMarkedBingo: boolean;
  hasValidDrawnBingo: boolean;
  allNumbers: number[];
  markedCount: number;
  totalCount: number;
} {
  const allNums = getAllTicketNumbers(ticket);
  const markedCount = allNums.filter((n) => markedNumbers.has(n)).length;
  const hasMarkedBingo = markedCount === allNums.length && allNums.length === 15;
  const hasValidDrawnBingo =
    hasMarkedBingo &&
    (drawnBalls ? allNums.every((num) => drawnBalls.includes(num)) : true);

  return {
    hasMarkedBingo,
    hasValidDrawnBingo,
    allNumbers: allNums,
    markedCount,
    totalCount: allNums.length,
  };
}
