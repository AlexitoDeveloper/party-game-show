import React, { useState, useEffect } from 'react';
import { GameDefinition } from '../../lib/games';

interface GameCoverImageProps {
  game: GameDefinition;
  gameIndex?: number;
  className?: string;
  showArtDecoFrame?: boolean;
  priority?: boolean;
  objectFit?: 'contain' | 'cover';
}

/**
 * Genera la lista de candidatos de ruta para la portada del juego.
 * Permite al usuario usar extensiones .png, .jpg, .jpeg, .webp y
 * nomenclaturas como '1_hits_and_run.png', 'hits_and_run.png' o 'music.png'.
 */
function getCandidates(game: GameDefinition, index: number): string[] {
  const num = index + 1;
  const slug = game.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const extensions = ['png', 'jpg', 'jpeg', 'webp'];
  const candidates: string[] = [];

  if (game.coverImage) {
    candidates.push(game.coverImage);
  }

  // Rutas con número de índice: /covers/1_hits_and_run.png, etc.
  for (const ext of extensions) {
    const candidate = `/covers/${num}_${slug}.${ext}`;
    if (!candidates.includes(candidate)) candidates.push(candidate);
  }

  // Rutas con slug directo: /covers/hits_and_run.png, etc.
  for (const ext of extensions) {
    const candidate = `/covers/${slug}.${ext}`;
    if (!candidates.includes(candidate)) candidates.push(candidate);
  }

  // Rutas con ID del juego: /covers/music.png, etc.
  for (const ext of extensions) {
    const candidate = `/covers/${game.id}.${ext}`;
    if (!candidates.includes(candidate)) candidates.push(candidate);
  }

  // Rutas numéricas: /covers/1.png, etc.
  for (const ext of extensions) {
    const candidate = `/covers/${num}.${ext}`;
    if (!candidates.includes(candidate)) candidates.push(candidate);
  }

  return candidates;
}

export const GameCoverImage: React.FC<GameCoverImageProps> = ({
  game,
  gameIndex = 0,
  className = '',
  showArtDecoFrame = true,
  priority = false,
  objectFit = 'contain',
}) => {
  const candidates = React.useMemo(() => getCandidates(game, gameIndex), [game, gameIndex]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [allFailed, setAllFailed] = useState(false);

  // Reiniciar estado si cambia el juego
  useEffect(() => {
    setCandidateIndex(0);
    setHasLoaded(false);
    setAllFailed(false);
  }, [game.id]);

  const currentSrc = candidates[candidateIndex];

  const handleImageError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setAllFailed(true);
    }
  };

  const handleImageLoad = () => {
    setHasLoaded(true);
    setAllFailed(false);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl flex items-center justify-center select-none ${
        showArtDecoFrame ? 'border-2 sm:border-4 border-[#d4af37] shadow-deco-gold bg-[#08080d]' : 'bg-[#08080d]'
      } ${className}`}
    >
      {/* IMAGEN REAL EN FORMATO HORIZONTAL COMPLETO (SIN RECORTES) */}
      {!allFailed && currentSrc && (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={`Portada explicativa oficial de ${game.title}`}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`max-w-full max-h-full w-auto h-auto ${
            objectFit === 'cover' ? 'w-full h-full object-cover' : 'object-contain'
          } transition-all duration-300 ${hasLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {/* FALLBACK ART DÉCO 1930s TEATRAL HORIZONTAL (SI NO SE ENCUENTRA EL ARCHIVO) */}
      {(allFailed || !hasLoaded) && (
        <div className="absolute inset-0 flex flex-col items-center justify-between p-4 sm:p-6 text-center bg-gradient-to-b from-[#1b120c] via-[#0d0d15] to-[#12080a] overflow-hidden">
          {/* Fondo geométrico Art Déco de rayos de sol */}
          <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#d4af37] stroke-current fill-none stroke-[0.3]">
              <circle cx="50" cy="50" r="45" />
              <circle cx="50" cy="50" r="35" />
              <circle cx="50" cy="50" r="25" />
              <line x1="50" y1="5" x2="50" y2="95" />
              <line x1="5" y1="50" x2="95" y2="50" />
              <line x1="18" y1="18" x2="82" y2="82" />
              <line x1="18" y1="82" x2="82" y2="18" />
              <polygon points="50,10 90,50 50,90 10,50" />
            </svg>
          </div>

          {/* Adornos en esquinas con palos de cartas francesas */}
          <span className="absolute top-2 left-3 text-xs text-[#d4af37]/60 font-serif">♠</span>
          <span className="absolute top-2 right-3 text-xs text-red-500/70 font-serif">♥</span>
          <span className="absolute bottom-2 left-3 text-xs text-[#d4af37]/60 font-serif">♣</span>
          <span className="absolute bottom-2 right-3 text-xs text-red-500/70 font-serif">♦</span>

          {/* Cabecera del cartel horizontal */}
          <div className="z-10 mt-1 flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 border border-[#d4af37]/40 shadow-sm">
              <span className="text-[10px] sm:text-xs uppercase font-broadway tracking-widest text-amber-300 font-black">
                DESAFÍO #{gameIndex + 1}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs uppercase font-vintage tracking-wider text-amber-100/70">
              • {game.category}
            </span>
          </div>

          {/* Emblema central con emoji y resplandor dorado */}
          <div className="z-10 my-auto flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#2a1c0d] to-[#120a16] border-2 border-[#d4af37] flex items-center justify-center shadow-deco-gold">
              <span className="text-3xl sm:text-4xl drop-shadow-lg">{game.emoji}</span>
            </div>
            <div className="text-left">
              <h3 className="text-xl sm:text-2xl font-broadway font-black uppercase text-gold-gradient tracking-wider drop-shadow-sm">
                {game.title}
              </h3>
              <p className="text-xs font-vintage text-amber-200/80 mt-0.5">
                {game.participantsLabel}
              </p>
            </div>
          </div>

          {/* Pie del cartel horizontal */}
          <div className="z-10 mb-1 w-full flex items-center justify-center gap-2 text-xs font-vintage text-amber-300/80">
            <span>{game.description}</span>
          </div>
        </div>
      )}

      {/* Esquinas Art Déco decorativas */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#d4af37] pointer-events-none m-1.5 opacity-80" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#d4af37] pointer-events-none m-1.5 opacity-80" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#d4af37] pointer-events-none m-1.5 opacity-80" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#d4af37] pointer-events-none m-1.5 opacity-80" />
    </div>
  );
};
