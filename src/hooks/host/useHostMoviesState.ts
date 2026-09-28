import { useState, useMemo } from 'react';
import { MovieItem, DEV_MOCK_MOVIES } from '../../lib/moviesData';
import { RoomSync } from '../../lib/roomSync';
import { BuzzerPressPayload, Team } from '../../lib/types';
import { TEAMS_CATALOG } from '../../lib/constants';

export interface UseHostMoviesStateParams {
  roomCode: string;
  roomSync: RoomSync;
  resetBuzzer: () => void;
  isLocked?: boolean;
  winner?: BuzzerPressPayload | null;
  teams?: Team[];
  selectedTeamCatalog?: (typeof TEAMS_CATALOG)[0] | null;
  handleScoreChange?: (teamId: string, delta: number) => void;
  setRoundHits?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  soundFX?: {
    playVictory: () => void;
    playFail: () => void;
  };
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function useHostMoviesState({
  roomCode,
  roomSync,
  resetBuzzer,
  isLocked,
  winner,
  teams = [],
  selectedTeamCatalog,
  handleScoreChange,
  setRoundHits,
  soundFX,
}: UseHostMoviesStateParams) {
  const [movieBank, setMovieBank] = useState<MovieItem[]>(() => {
    const saved = localStorage.getItem(`party_movie_bank_${roomCode}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return shuffleArray(DEV_MOCK_MOVIES);
  });
  const [activePackName, setActivePackName] = useState<string>(() => {
    return localStorage.getItem(`party_movie_pack_name_${roomCode}`) || 'Modo Demo (Pruebas)';
  });
  const [movieIndex, setMovieIndex] = useState(0);
  const [movieFrameLevel, setMovieFrameLevel] = useState<1 | 2 | 3 | 4>(1);
  const [movieRevealed, setMovieRevealed] = useState(false);
  const [movieCategoryFilter, setMovieCategoryFilter] = useState<'Todos' | 'Taquillazos' | 'Disney / Pixar' | 'Terror'>('Todos');

  // En la prueba de emojis se juegan todas las películas mezcladas y en orden aleatorio
  const filteredMovies = useMemo(() => {
    if (movieCategoryFilter === 'Todos') return movieBank;
    return movieBank.filter((m) => m.category === movieCategoryFilter);
  }, [movieCategoryFilter, movieBank]);

  const currentMovie: MovieItem = filteredMovies[movieIndex % filteredMovies.length] || movieBank[0] || DEV_MOCK_MOVIES[0];

  const syncMovieState = (
    index: number,
    level: 1 | 2 | 3 | 4,
    revealed: boolean,
    cat?: string,
    targetMovie?: MovieItem
  ) => {
    const mov = targetMovie || filteredMovies[index % filteredMovies.length] || currentMovie;
    roomSync.broadcast({
      type: 'MOVIE_STATE_UPDATE',
      payload: {
        movieIndex: index,
        frameLevel: level,
        isRevealed: revealed,
        categoryFilter: cat || movieCategoryFilter,
        movieData: mov,
      },
    });
  };

  const handleShuffleMovies = () => {
    const shuffled = shuffleArray(movieBank);
    setMovieBank(shuffled);
    localStorage.setItem(`party_movie_bank_${roomCode}`, JSON.stringify(shuffled));
    setMovieIndex(0);
    setMovieFrameLevel(1);
    setMovieRevealed(false);
    resetBuzzer();
    syncMovieState(0, 1, false, undefined, shuffled[0]);
  };

  const handleLoadOfficialPack = async () => {
    try {
      const res = await fetch('/packs/pack_peliculas_oficial.json');
      if (!res.ok) throw new Error('No se pudo cargar el archivo');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Mezclar aleatoriamente el pack de películas para que no salgan por categorías
        const shuffled = shuffleArray(data);
        setMovieBank(shuffled);
        const name = `Pack Oficial Fiesta (${shuffled.length} películas)`;
        setActivePackName(name);
        localStorage.setItem(`party_movie_bank_${roomCode}`, JSON.stringify(shuffled));
        localStorage.setItem(`party_movie_pack_name_${roomCode}`, name);
        setMovieIndex(0);
        setMovieFrameLevel(1);
        setMovieRevealed(false);
        resetBuzzer();
        syncMovieState(0, 1, false, undefined, shuffled[0]);
      }
    } catch (err) {
      alert('Error al cargar el pack oficial de películas');
    }
  };

  const handleResetToDemo = () => {
    const shuffled = shuffleArray(DEV_MOCK_MOVIES);
    setMovieBank(shuffled);
    setActivePackName('Modo Demo (Pruebas)');
    localStorage.removeItem(`party_movie_bank_${roomCode}`);
    localStorage.removeItem(`party_movie_pack_name_${roomCode}`);
    setMovieIndex(0);
    setMovieFrameLevel(1);
    setMovieRevealed(false);
    resetBuzzer();
    syncMovieState(0, 1, false, undefined, shuffled[0]);
  };

  const handleUploadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const shuffled = shuffleArray(parsed);
          setMovieBank(shuffled);
          const name = `Custom: ${file.name} (${shuffled.length} pelis)`;
          setActivePackName(name);
          localStorage.setItem(`party_movie_bank_${roomCode}`, JSON.stringify(shuffled));
          localStorage.setItem(`party_movie_pack_name_${roomCode}`, name);
          setMovieIndex(0);
          setMovieFrameLevel(1);
          setMovieRevealed(false);
          resetBuzzer();
          syncMovieState(0, 1, false, undefined, shuffled[0]);
        } else {
          alert('El archivo no contiene un array válido de películas');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON');
      }
    };
    reader.readAsText(file);
  };

  const handleNextMovie = () => {
    const nextIdx = (movieIndex + 1) % filteredMovies.length;
    setMovieIndex(nextIdx);
    setMovieFrameLevel(1);
    setMovieRevealed(false);
    resetBuzzer();
    syncMovieState(nextIdx, 1, false);
  };

  const handlePrevMovie = () => {
    const prevIdx = (movieIndex - 1 + filteredMovies.length) % filteredMovies.length;
    setMovieIndex(prevIdx);
    setMovieFrameLevel(1);
    setMovieRevealed(false);
    resetBuzzer();
    syncMovieState(prevIdx, 1, false);
  };

  const handleSetFrameLevel = (lvl: 1 | 2 | 3 | 4) => {
    setMovieFrameLevel(lvl);
    syncMovieState(movieIndex, lvl, movieRevealed);
  };

  const handleToggleReveal = () => {
    const nextRevealed = !movieRevealed;
    setMovieRevealed(nextRevealed);
    syncMovieState(movieIndex, movieFrameLevel, nextRevealed);
  };

  const handleCategoryFilterChange = (cat: 'Todos' | 'Taquillazos' | 'Disney / Pixar' | 'Terror') => {
    setMovieCategoryFilter(cat);
    setMovieIndex(0);
    setMovieFrameLevel(1);
    setMovieRevealed(false);
    resetBuzzer();
    syncMovieState(0, 1, false, cat);
  };

  const autoMoviePoints = movieFrameLevel === 1 ? 3 : movieFrameLevel === 2 ? 2 : 1;

  const handleValidateMovieHitAuto = () => {
    const targetTeam = winner?.teamId
      ? teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId)
      : selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : teams.find((t) => t.is_active);

    if (!targetTeam) {
      alert('Selecciona un equipo primero');
      return;
    }

    if (handleScoreChange) {
      handleScoreChange(targetTeam.id, autoMoviePoints);
    }
    if (setRoundHits) {
      setRoundHits((prev) => ({
        ...prev,
        [targetTeam.id]: (prev[targetTeam.id] || 0) + 1,
      }));
    }
    setMovieRevealed(true);
    if (isLocked) {
      resetBuzzer();
    }
    syncMovieState(movieIndex, movieFrameLevel, true);
    soundFX?.playVictory();
  };

  const handleValidateMovieMissAuto = () => {
    const targetTeam = winner?.teamId
      ? teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId)
      : selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : teams.find((t) => t.is_active);

    if (targetTeam && handleScoreChange) {
      handleScoreChange(targetTeam.id, -1);
    }
    if (isLocked) {
      resetBuzzer();
    }
    soundFX?.playFail();
  };

  return {
    movieBank,
    activePackName,
    movieIndex,
    movieFrameLevel,
    movieRevealed,
    movieCategoryFilter,
    filteredMovies,
    currentMovie,
    autoMoviePoints,
    syncMovieState,
    handleLoadOfficialPack,
    handleResetToDemo,
    handleUploadJson,
    handleShuffleMovies,
    handleNextMovie,
    handlePrevMovie,
    handleSetFrameLevel,
    handleToggleReveal,
    handleCategoryFilterChange,
    handleValidateMovieHitAuto,
    handleValidateMovieMissAuto,
  };
}
