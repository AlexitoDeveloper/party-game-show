import React, { useState } from 'react';
import {
  Film,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  Sparkle,
  Check,
  X,
  Shuffle,
  Settings,
} from 'lucide-react';
import { MovieItem, MovieCategory } from '../../../lib/moviesData';

export interface HostMoviesControlsProps {
  activePackName: string;
  onLoadOfficialPack: () => void;
  onUploadJson?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetToDemo: () => void;
  onShuffleMovies?: () => void;
  movieIndex: number;
  filteredMovies: MovieItem[];
  movieCategoryFilter?: 'Todos' | MovieCategory;
  onCategoryFilterChange?: (cat: 'Todos' | MovieCategory) => void;
  currentMovie: MovieItem;
  movieRevealed: boolean;
  onToggleReveal: () => void;
  movieFrameLevel: 1 | 2 | 3 | 4;
  onSetFrameLevel: (level: 1 | 2 | 3 | 4) => void;
  autoMoviePoints: number;
  onValidateMovieHitAuto: () => void;
  onValidateMovieMissAuto: () => void;
  onPrevMovie: () => void;
  onNextMovie: () => void;
}

export const HostMoviesControls: React.FC<HostMoviesControlsProps> = ({
  activePackName,
  onLoadOfficialPack,
  onResetToDemo,
  onShuffleMovies,
  movieIndex,
  filteredMovies,
  currentMovie,
  movieRevealed,
  onToggleReveal,
  movieFrameLevel,
  onSetFrameLevel,
  autoMoviePoints,
  onValidateMovieHitAuto,
  onValidateMovieMissAuto,
  onPrevMovie,
  onNextMovie,
}) => {
  const [showPackSettings, setShowPackSettings] = useState(false);

  return (
    <div className="pt-2 border-t border-[#d4af37]/30 space-y-3">
      {/* CABECERA COMPACTA: NAVEGACIÓN + AJUSTES DE PACK */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Film className="w-4 h-4 text-[#d4af37] shrink-0" />
          <span className="text-xs font-broadway uppercase tracking-wider text-gold-gradient truncate">
            Enigma {movieIndex + 1}/{filteredMovies.length}
          </span>
          {activePackName.includes('Demo') && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-500/30 font-vintage shrink-0">
              Demo
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowPackSettings((v) => !v)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-vintage font-bold border flex items-center gap-1 transition-all ${
              showPackSettings
                ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                : 'bg-[#14141e] text-amber-200/70 border-[#d4af37]/30'
            }`}
            title="Opciones de Pack y Mezcla"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Pack</span>
          </button>

          <button
            onClick={onPrevMovie}
            className="p-1.5 bg-[#14141e] hover:bg-[#1a1a28] border border-[#d4af37]/30 rounded-xl text-amber-200 active:scale-95"
            title="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextMovie}
            className="px-3 py-1.5 bg-gold-gradient text-slate-950 font-broadway font-black rounded-xl text-xs uppercase flex items-center gap-1 shadow-sm active:scale-95"
          >
            <span>Sig.</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PANEL COLAPSABLE DE PACK Y MEZCLA */}
      {showPackSettings && (
        <div className="bg-[#0c0c14] border border-[#d4af37]/40 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-amber-200/80 font-vintage">
            Activo: <strong className="text-white font-broadway">{activePackName}</strong>
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                onLoadOfficialPack();
                setShowPackSettings(false);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-gold-gradient text-slate-950 font-broadway font-black flex items-center gap-1 text-xs uppercase"
            >
              <Sparkle className="w-3.5 h-3.5" />
              <span>Cargar Pack Fiesta</span>
            </button>
            {onShuffleMovies && (
              <button
                onClick={onShuffleMovies}
                className="px-2.5 py-1.5 rounded-xl bg-[#14141e] text-amber-200 border border-[#d4af37]/30 flex items-center gap-1 text-xs font-vintage font-bold"
              >
                <Shuffle className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Mezclar</span>
              </button>
            )}
            {!activePackName.includes('Demo') && (
              <button
                onClick={onResetToDemo}
                className="px-2.5 py-1.5 rounded-xl bg-[#14141e] text-amber-200/60 border border-[#d4af37]/30 text-xs font-vintage"
              >
                Modo Demo
              </button>
            )}
          </div>
        </div>
      )}

      {/* CHIVATO COMPACTO PARA EL ANFITRIÓN */}
      <div className="bg-[#07070a]/95 border border-[#d4af37]/40 rounded-2xl p-3 space-y-2 shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[11px] font-vintage font-bold uppercase text-amber-300/80 block">
              {currentMovie.genreEmoji} {currentMovie.category} • {currentMovie.year}
            </span>
            <h3 className="text-base sm:text-lg font-broadway text-gold-gradient leading-tight">
              {currentMovie.title}
            </h3>
          </div>
          <div className="bg-[#14141e] px-2.5 py-1 rounded-xl border border-[#d4af37]/30 text-base shrink-0 tracking-widest">
            {currentMovie.emojisFull.join('')}
          </div>
        </div>

        <p className="text-xs text-amber-200/80 font-vintage italic bg-[#0c0c14] px-2.5 py-1.5 rounded-xl border border-[#d4af37]/25">
          💡 {currentMovie.explanation}
        </p>
      </div>

      {/* SELECTOR DE LAS 4 PISTAS EN PANTALLA */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-broadway uppercase text-amber-300/90 block">
          Nivel de Pista en TV:
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { level: 1 as const, label: '1️⃣ 3 Emojis', pts: '+3 pts' },
            { level: 2 as const, label: '2️⃣ +Huecos', pts: '+2 pts' },
            { level: 3 as const, label: '3️⃣ +Pista', pts: '+1 pt' },
            { level: 4 as const, label: '4️⃣ Test', pts: '+1 pt' },
          ].map((st) => (
            <button
              key={st.level}
              onClick={() => onSetFrameLevel(st.level)}
              className={`py-2 px-1.5 rounded-xl text-center transition-all flex flex-col items-center justify-center border ${
                movieFrameLevel === st.level
                  ? 'bg-gold-gradient text-slate-950 font-black border-[#f5eedb] shadow-sm scale-[1.02]'
                  : 'bg-[#14141e] text-amber-200/70 border-[#d4af37]/30'
              }`}
            >
              <span className="text-xs font-broadway leading-tight">{st.label}</span>
              <span className="text-[10px] font-mono opacity-80">{st.pts}</span>
            </button>
          ))}
        </div>
      </div>

      {/* BOTONES PRINCIPALES DE ACCIÓN (PULGAR) */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onValidateMovieHitAuto}
          className="py-3 px-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-broadway font-black rounded-xl text-xs uppercase flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Acierto (+{autoMoviePoints})</span>
        </button>

        <button
          onClick={onValidateMovieMissAuto}
          className="py-3 px-2 bg-red-600/80 hover:bg-red-600 text-white border border-red-400/40 font-broadway font-bold rounded-xl text-xs uppercase flex items-center justify-center gap-1 active:scale-95 transition-all"
        >
          <X className="w-4 h-4 stroke-[3]" />
          <span>Fallo (-1)</span>
        </button>

        <button
          onClick={onToggleReveal}
          className={`py-3 px-2 rounded-xl text-xs font-broadway font-black uppercase flex items-center justify-center gap-1 transition-all shadow-md active:scale-95 ${
            movieRevealed
              ? 'bg-purple-600 text-white'
              : 'bg-[#14141e] text-amber-200 border border-[#d4af37]/50'
          }`}
        >
          {movieRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{movieRevealed ? 'Ocultar' : 'Revelar'}</span>
        </button>
      </div>
    </div>
  );
};

