import React from 'react';
import {
  Film,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  FolderUp,
  PackageCheck,
  Sparkle,
  Check,
  X,
} from 'lucide-react';
import { MovieItem } from '../../../lib/moviesData';

export interface HostMoviesControlsProps {
  activePackName: string;
  onLoadOfficialPack: () => void;
  onUploadJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetToDemo: () => void;
  movieIndex: number;
  filteredMovies: MovieItem[];
  movieCategoryFilter: 'Todos' | 'Taquillazos' | 'Disney / Pixar' | 'Terror';
  onCategoryFilterChange: (cat: 'Todos' | 'Taquillazos' | 'Disney / Pixar' | 'Terror') => void;
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
  onUploadJson,
  onResetToDemo,
  movieIndex,
  filteredMovies,
  movieCategoryFilter,
  onCategoryFilterChange,
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
  return (
    <div className="pt-4 border-t border-[#d4af37]/30 space-y-4">
      {/* BARRA DE GESTIÓN DE PACK / PROTECCIÓN ANTI-SPOILERS */}
      <div className="bg-[#0c0c14]/95 border border-[#d4af37]/40 rounded-2xl p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-deco-gold">
        <div className="flex items-center gap-2">
          <PackageCheck className="w-4 h-4 text-[#d4af37] shrink-0" />
          <div>
            <span className="text-amber-200/70 font-vintage font-medium">Pack Activo: </span>
            <strong className="text-white font-broadway">{activePackName}</strong>
            {activePackName.includes('Demo') && (
              <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-vintage">
                🛡️ Modo Anti-Spoiler Activo
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={onLoadOfficialPack}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gold-gradient text-slate-950 font-broadway font-black flex items-center gap-1.5 transition-all shadow-sm border border-[#f5eedb]/40 text-xs uppercase"
            title="Cargar las 21 películas oficiales para la fiesta"
          >
            <Sparkle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pack Oficial Fiesta</span>
            <span className="sm:hidden">Oficial</span>
          </button>

          <label className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#14141e] hover:bg-[#1a1a28] text-amber-200 border border-[#d4af37]/30 font-vintage font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm">
            <FolderUp className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Subir JSON</span>
            <span className="sm:hidden">JSON</span>
            <input type="file" accept=".json" onChange={onUploadJson} className="hidden" />
          </label>

          {!activePackName.includes('Demo') && (
            <button
              onClick={onResetToDemo}
              className="px-2.5 py-1.5 rounded-xl bg-[#14141e] hover:bg-[#1a1a28] text-amber-200/60 hover:text-white border border-[#d4af37]/30 text-[11px] font-vintage"
              title="Volver a las películas de prueba para seguir desarrollando sin spoilers"
            >
              <span className="hidden sm:inline">Modo Demo</span>
              <span className="sm:hidden">Demo</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-[#d4af37]" />
          <span className="text-sm font-broadway uppercase tracking-wider text-gold-gradient">
            Película en Pantalla ({movieIndex + 1}/{filteredMovies.length})
          </span>
        </div>

        {/* Filtros por Categoría: Taquillazos, Disney/Pixar, Terror */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['Todos', 'Taquillazos', 'Disney / Pixar', 'Terror'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryFilterChange(cat)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-vintage font-bold whitespace-nowrap transition-all ${
                movieCategoryFilter === cat
                  ? 'bg-gold-gradient text-slate-950 shadow-md font-black border border-[#f5eedb]/50'
                  : 'bg-[#14141e] text-amber-200/70 hover:text-white border border-[#d4af37]/30'
              }`}
            >
              {cat === 'Taquillazos' ? '🍿 Taquillazos' : cat === 'Disney / Pixar' ? '🏰 Disney / Pixar' : cat === 'Terror' ? '👻 Terror' : '🎬 Todos'}
            </button>
          ))}
        </div>
      </div>

      {/* TARJETA DE CHIVATO SECRETO PARA EL ANFITRIÓN */}
      <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentMovie.genreEmoji}</span>
            <span className="text-[10px] font-vintage font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {currentMovie.category} • Año {currentMovie.year}
            </span>
          </div>
          <h3 className="text-xl font-broadway text-gold-gradient">
            {currentMovie.title}
            {currentMovie.originalTitle && currentMovie.originalTitle !== currentMovie.title && (
              <span className="text-xs text-amber-200/60 font-editorial font-normal ml-2">({currentMovie.originalTitle})</span>
            )}
          </h3>
          {currentMovie.director && (
            <p className="text-xs font-vintage text-amber-200/70">
              Director: <span className="text-white font-broadway">{currentMovie.director}</span>
            </p>
          )}

          {/* Emojis mostrados por fases al host */}
          <div className="flex flex-wrap items-center gap-2 py-1">
            <div className="flex items-center gap-1.5 bg-[#14141e] px-2.5 py-1 rounded-xl border border-[#d4af37]/30 text-base">
              <span className="text-[10px] text-amber-400 font-broadway uppercase">P1 (2 emojis):</span>
              {currentMovie.emojisStage1.map((em, idx) => (
                <span key={idx}>{em}</span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 bg-[#14141e] px-2.5 py-1 rounded-xl border border-[#d4af37]/30 text-base">
              <span className="text-[10px] text-sky-400 font-broadway uppercase">P2 (4 emojis):</span>
              {currentMovie.emojisStage2.map((em, idx) => (
                <span key={idx}>{em}</span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 bg-[#14141e] px-2.5 py-1 rounded-xl border border-[#d4af37]/30 text-base">
              <span className="text-[10px] text-emerald-400 font-broadway uppercase">P3 (Completo):</span>
              {currentMovie.emojisFull.map((em, idx) => (
                <span key={idx}>{em}</span>
              ))}
            </div>
          </div>

          <p className="text-xs text-amber-200/80 font-vintage italic bg-[#0c0c14] px-3 py-1.5 rounded-xl border border-[#d4af37]/30">
            💡 Significado: {currentMovie.explanation}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={onToggleReveal}
            className={`flex-1 md:flex-none px-4 py-3 rounded-xl text-xs font-broadway font-black uppercase flex items-center justify-center gap-1.5 transition-all shadow-md ${
              movieRevealed
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(52,211,153,0.35)]'
                : 'bg-gold-gradient hover:brightness-110 text-slate-950 shadow-deco-gold border border-[#f5eedb]/40'
            }`}
          >
            {movieRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{movieRevealed ? 'Ocultar' : 'Revelar'}</span>
            <span className="hidden sm:inline">{movieRevealed ? ' Solución en TV' : ' Título en TV!'}</span>
          </button>
        </div>
      </div>

      {/* VALIDACIÓN AUTOMÁTICA SEGÚN EMOJIS EN PANTALLA */}
      <div className="bg-[#0c0c14]/90 border border-[#d4af37]/40 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-deco-gold">
        <div className="flex items-center gap-2">
          <span className="text-xs font-broadway text-amber-300 uppercase">
            Puntuación Automática:
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-gold-gradient text-slate-950 font-broadway font-black text-xs shadow-sm">
            {movieFrameLevel === 1 ? 'Nivel 1 (2 Emojis) = +3 pts' : movieFrameLevel === 2 ? 'Nivel 2 (4 Emojis) = +2 pts' : 'Nivel 3/4 (Pistas) = +1 pt'}
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onValidateMovieHitAuto}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-broadway font-black rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Validar Acierto (+{autoMoviePoints} pts)</span>
          </button>
          <button
            onClick={onValidateMovieMissAuto}
            className="px-3 py-2.5 bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 font-broadway font-bold rounded-xl text-xs uppercase flex items-center justify-center gap-1 active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
            <span>Fallo (-1)</span>
          </button>
        </div>
      </div>

      {/* SELECTOR DE NIVEL DE PISTA / EMOJIS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#07070a]/80 p-3 rounded-2xl border border-[#d4af37]/30">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-vintage font-bold text-amber-200/80">Pista:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onSetFrameLevel(1)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-broadway transition-all ${
                movieFrameLevel === 1
                  ? 'bg-gold-gradient text-slate-950 shadow-deco-gold font-black scale-105 border border-[#f5eedb]/40'
                  : 'bg-[#14141e] text-amber-200/60 hover:text-white border border-[#d4af37]/30'
              }`}
            >
              <span className="sm:hidden">P1 (+5)</span>
              <span className="hidden sm:inline">P1: 2 Emojis (+5)</span>
            </button>
            <button
              onClick={() => onSetFrameLevel(2)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-broadway transition-all ${
                movieFrameLevel === 2
                  ? 'bg-gold-gradient text-slate-950 shadow-deco-gold font-black scale-105 border border-[#f5eedb]/40'
                  : 'bg-[#14141e] text-amber-200/60 hover:text-white border border-[#d4af37]/30'
              }`}
            >
              <span className="sm:hidden">P2 (+3)</span>
              <span className="hidden sm:inline">P2: 4 Emojis (+3)</span>
            </button>
            <button
              onClick={() => onSetFrameLevel(3)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-broadway transition-all ${
                movieFrameLevel === 3
                  ? 'bg-gold-gradient text-slate-950 shadow-deco-gold font-black scale-105 border border-[#f5eedb]/40'
                  : 'bg-[#14141e] text-amber-200/60 hover:text-white border border-[#d4af37]/30'
              }`}
            >
              <span className="sm:hidden">P3 (+1)</span>
              <span className="hidden sm:inline">P3: Todos (+1)</span>
            </button>
            <button
              onClick={() => onSetFrameLevel(4)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-broadway transition-all ${
                movieFrameLevel === 4
                  ? 'bg-gold-gradient text-slate-950 shadow-deco-gold font-black scale-105 border border-[#f5eedb]/40'
                  : 'bg-[#14141e] text-amber-200/60 hover:text-white border border-[#d4af37]/30'
              }`}
            >
              <span className="sm:hidden">P4 (+1)</span>
              <span className="hidden sm:inline">P4: Pistas (+1)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrevMovie}
            className="p-2 bg-[#14141e] hover:bg-[#1a1a28] border border-[#d4af37]/30 rounded-xl text-amber-200 active:scale-95 transition-all"
            title="Película anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextMovie}
            className="px-3.5 sm:px-4 py-2 bg-gold-gradient hover:brightness-110 text-slate-950 font-broadway font-black rounded-xl text-xs uppercase flex items-center gap-1.5 shadow-deco-gold active:scale-95 transition-all border border-[#f5eedb]/40"
          >
            <span className="hidden sm:inline">Siguiente Película</span>
            <span className="sm:hidden">Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
