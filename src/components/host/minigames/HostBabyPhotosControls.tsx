import React from 'react';
import { Camera, Eye, EyeOff, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { BabyPhotoItem } from '../../../lib/babyPhotosData';

export interface HostBabyPhotosControlsProps {
  babyPhotoIndex: number;
  babyPhotosList: BabyPhotoItem[];
  currentBabyPhoto: BabyPhotoItem;
  babyPhotoRevealed: boolean;
  onToggleBabyPhotoReveal: () => void;
  onValidateBabyPhotoHit: () => void;
  onValidateBabyPhotoMiss: () => void;
  onSelectBabyPhotoDirect: (idx: number) => void;
  onPrevBabyPhoto: () => void;
  onNextBabyPhoto: () => void;
}

export const HostBabyPhotosControls: React.FC<HostBabyPhotosControlsProps> = ({
  babyPhotoIndex,
  babyPhotosList,
  currentBabyPhoto,
  babyPhotoRevealed,
  onToggleBabyPhotoReveal,
  onValidateBabyPhotoHit,
  onValidateBabyPhotoMiss,
  onSelectBabyPhotoDirect,
  onPrevBabyPhoto,
  onNextBabyPhoto,
}) => {
  return (
    <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/45 rounded-3xl p-6 shadow-deco-gold space-y-5 deco-card-frame">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d4af37]/30 pb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#d4af37]" />
          <span className="text-sm font-broadway uppercase tracking-wider text-gold-gradient">
            Proyector de Diapositivas ({babyPhotoIndex + 1}/{babyPhotosList.length})
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-vintage font-bold border border-red-500/30">
          <span>🚫 Regla: Si es su foto, −2 pts si pulsa</span>
        </div>
      </div>

      {/* CHIVATO SECRETO PARA EL ANFITRIÓN */}
      <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Miniatura previa de la foto */}
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/60 border-2 border-[#d4af37]/50 flex-shrink-0 flex items-center justify-center shadow-md">
          <img
            src={currentBabyPhoto.imageUrl}
            alt={currentBabyPhoto.personName}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-vintage font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {currentBabyPhoto.category}
            </span>
            {currentBabyPhoto.ownerPlayerName && (
              <span className="text-[10px] font-vintage font-bold uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                Prohibido pulsar a: {currentBabyPhoto.ownerPlayerName}
              </span>
            )}
          </div>
          <h3 className="text-xl font-broadway text-gold-gradient">
            {currentBabyPhoto.personName}
          </h3>
          {currentBabyPhoto.hint && (
            <p className="text-xs font-vintage text-amber-200/70">
              Pista: <span className="text-white font-semibold">{currentBabyPhoto.hint}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          <button
            onClick={onToggleBabyPhotoReveal}
            className={`flex-1 md:flex-none px-4 py-3 rounded-xl text-xs font-broadway font-black uppercase flex items-center justify-center gap-1.5 transition-all shadow-md ${
              babyPhotoRevealed
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(52,211,153,0.35)]'
                : 'bg-gold-gradient hover:brightness-110 text-slate-950 shadow-deco-gold border border-[#f5eedb]/40'
            }`}
          >
            {babyPhotoRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{babyPhotoRevealed ? 'Ocultar' : 'Revelar'}</span>
            <span className="hidden sm:inline"> Solución en TV</span>
          </button>

          <button
            onClick={onValidateBabyPhotoHit}
            className="flex-1 md:flex-none px-3.5 py-3 rounded-xl text-xs font-broadway font-black uppercase flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 bg-emerald-500 hover:bg-emerald-400 text-slate-950"
            title="Validar acierto de bebé para el equipo activo"
          >
            <Check className="w-4 h-4" />
            <span>Acierto</span>
          </button>

          <button
            onClick={onValidateBabyPhotoMiss}
            className="px-3 py-3 rounded-xl text-xs font-broadway font-black uppercase flex items-center justify-center gap-1 transition-all shadow-md active:scale-95 bg-red-600/80 hover:bg-red-600 text-white"
            title="Fallo tras pulsar (-1)"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Fallo</span>
          </button>
        </div>
      </div>

      {/* SELECTOR RÁPIDO DE FOTOGRAFÍAS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#07070a]/80 p-3 rounded-2xl border border-[#d4af37]/30">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-xl">
          {babyPhotosList.map((photo, idx) => (
            <button
              key={photo.id || idx}
              onClick={() => onSelectBabyPhotoDirect(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-broadway whitespace-nowrap transition-all ${
                babyPhotoIndex === idx
                  ? 'bg-gold-gradient text-slate-950 font-black shadow-deco-gold scale-105 border border-[#f5eedb]/40'
                  : 'bg-[#14141e] text-amber-200/60 hover:text-white border border-[#d4af37]/30'
              }`}
            >
              Foto {idx + 1}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrevBabyPhoto}
            className="p-2 bg-[#14141e] hover:bg-[#1a1a28] border border-[#d4af37]/30 rounded-xl text-amber-200 active:scale-95 transition-all"
            title="Foto anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextBabyPhoto}
            className="px-3.5 sm:px-4 py-2 bg-gold-gradient hover:brightness-110 text-slate-950 font-broadway font-black rounded-xl text-xs uppercase flex items-center gap-1.5 shadow-deco-gold active:scale-95 transition-all border border-[#f5eedb]/40"
          >
            <span className="hidden sm:inline">Siguiente Foto</span>
            <span className="sm:hidden">Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
