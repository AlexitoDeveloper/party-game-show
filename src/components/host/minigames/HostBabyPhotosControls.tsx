import React, { useState } from 'react';
import { Camera, Eye, EyeOff, Check, X, ChevronLeft, ChevronRight, Sparkle, Settings } from 'lucide-react';
import { BabyPhotoItem } from '../../../lib/babyPhotosData';

export interface HostBabyPhotosControlsProps {
  activePackName: string;
  onLoadOfficialPack: () => void;
  onUploadJson?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetToDemo: () => void;
  babyPhotoIndex: number;
  babyPhotosList: BabyPhotoItem[];
  currentBabyPhoto: BabyPhotoItem;
  babyPhotoRevealed: boolean;
  onToggleBabyPhotoReveal: () => void;
  onValidateBabyPhotoHit: () => void;
  onValidateBabyPhotoMiss: () => void;
  onValidateBabyPhotoSelf?: () => void;
  onSelectBabyPhotoDirect: (idx: number) => void;
  onPrevBabyPhoto: () => void;
  onNextBabyPhoto: () => void;
}

export const HostBabyPhotosControls: React.FC<HostBabyPhotosControlsProps> = ({
  activePackName,
  onLoadOfficialPack,
  onResetToDemo,
  babyPhotoIndex,
  babyPhotosList,
  currentBabyPhoto,
  babyPhotoRevealed,
  onToggleBabyPhotoReveal,
  onValidateBabyPhotoHit,
  onValidateBabyPhotoMiss,
  onValidateBabyPhotoSelf,
  onSelectBabyPhotoDirect,
  onPrevBabyPhoto,
  onNextBabyPhoto,
}) => {
  const [showPackSettings, setShowPackSettings] = useState(false);

  return (
    <div className="pt-2 border-t border-[#d4af37]/30 space-y-3">
      {/* CABECERA COMPACTA: NAVEGACIÓN + PACK */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Camera className="w-4 h-4 text-[#d4af37] shrink-0" />
          <span className="text-xs font-broadway uppercase tracking-wider text-gold-gradient truncate">
            Diapositiva {babyPhotoIndex + 1}/{babyPhotosList.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowPackSettings((v) => !v)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-vintage font-bold border flex items-center gap-1 transition-all ${
              showPackSettings
                ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                : 'bg-[#14141e] text-amber-200/70 border-[#d4af37]/30'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Pack</span>
          </button>
          <button
            onClick={onPrevBabyPhoto}
            className="p-1.5 bg-[#14141e] hover:bg-[#1a1a28] border border-[#d4af37]/30 rounded-xl text-amber-200 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextBabyPhoto}
            className="px-3 py-1.5 bg-gold-gradient text-slate-950 font-broadway font-black rounded-xl text-xs uppercase flex items-center gap-1 shadow-sm active:scale-95"
          >
            <span>Sig.</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showPackSettings && (
        <div className="bg-[#07070a]/95 border border-[#d4af37]/40 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-amber-200/70 font-vintage">
            Pack: <strong className="text-white font-broadway">{activePackName}</strong>
          </span>
          <div className="flex items-center gap-1.5">
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

      {/* PREVIEW COMPACTA + VEREDICTO */}
      <div className="bg-[#07070a]/95 border border-[#d4af37]/40 rounded-2xl p-3 space-y-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/60 border border-[#d4af37]/50 flex-shrink-0 flex items-center justify-center">
            <img
              src={currentBabyPhoto.imageUrl}
              alt={`Foto ${babyPhotoIndex + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-broadway text-gold-gradient">
              Foto #{babyPhotoIndex + 1}
            </h3>
            <p className="text-xs font-vintage text-amber-200/80">
              🚫 Si el propio dueño pulsa, réstale −2 pts en Equipos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={onValidateBabyPhotoHit}
            className="py-3 px-2 rounded-xl text-xs font-broadway font-black uppercase flex items-center justify-center gap-1 transition-all shadow-md active:scale-95 bg-emerald-500 hover:bg-emerald-400 text-slate-950"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Acierto (+2)</span>
          </button>

          <button
            onClick={onValidateBabyPhotoMiss}
            className="py-3 px-2 rounded-xl text-xs font-broadway font-black uppercase flex items-center justify-center gap-1 transition-all shadow-md active:scale-95 bg-red-600/85 hover:bg-red-600 text-white"
          >
            <X className="w-4 h-4 stroke-[3]" />
            <span>Fallo (-1)</span>
          </button>

          {onValidateBabyPhotoSelf && (
            <button
              onClick={onValidateBabyPhotoSelf}
              className="py-3 px-2 rounded-xl text-xs font-broadway font-black uppercase flex items-center justify-center gap-1 transition-all shadow-md active:scale-95 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200"
              title="Penalización por pulsar en su propia foto (-2 pts)"
            >
              <span>🚫 Propia (-2)</span>
            </button>
          )}

          <button
            onClick={onToggleBabyPhotoReveal}
            className={`py-3 px-2 rounded-xl text-xs font-broadway font-bold flex items-center justify-center gap-1 transition-all border active:scale-95 ${
              babyPhotoRevealed
                ? 'bg-purple-600 text-white border-purple-400'
                : 'bg-[#14141e] text-amber-200 border-[#d4af37]/40'
            }`}
          >
            {babyPhotoRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{babyPhotoRevealed ? 'Ocultar' : 'Cartel TV'}</span>
          </button>
        </div>
      </div>

      {/* SELECTOR RÁPIDO DE DIAPOSITIVAS EN UNA LÍNEA */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {babyPhotosList.map((photo, idx) => (
          <button
            key={photo.id || idx}
            onClick={() => onSelectBabyPhotoDirect(idx)}
            className={`px-2.5 py-1 rounded-xl text-xs font-broadway whitespace-nowrap transition-all shrink-0 ${
              babyPhotoIndex === idx
                ? 'bg-gold-gradient text-slate-950 font-black'
                : 'bg-[#14141e] text-amber-200/60 border border-[#d4af37]/30'
            }`}
          >
            #{idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

