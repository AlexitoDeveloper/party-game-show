import React from 'react';
import { Camera, Eye, EyeOff, Check, X, ChevronLeft, ChevronRight, PackageCheck, Sparkle } from 'lucide-react';
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
  onSelectBabyPhotoDirect: (idx: number) => void;
  onPrevBabyPhoto: () => void;
  onNextBabyPhoto: () => void;
}

export const HostBabyPhotosControls: React.FC<HostBabyPhotosControlsProps> = ({
  activePackName,
  onLoadOfficialPack,
  onUploadJson,
  onResetToDemo,
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
    <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/45 rounded-3xl p-6 shadow-deco-gold space-y-5 hell-card-frame">
      {/* BARRA DE GESTIÓN DE PACK / PROTECCIÓN ANTI-SPOILERS */}
      <div className="bg-[#07070a]/95 border border-[#d4af37]/40 rounded-2xl p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-deco-gold">
        <div className="flex items-center gap-2">
          <PackageCheck className="w-4 h-4 text-[#d4af37] shrink-0" />
          <div>
            <span className="text-amber-200/70 font-vintage font-medium">Pack Activo: </span>
            <strong className="text-white font-broadway">{activePackName}</strong>
            {activePackName.includes('Demo') && (
              <span className="ml-2 text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-vintage">
                🛡️ Modo Anti-Spoiler Activo
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={onLoadOfficialPack}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gold-gradient text-slate-950 font-broadway font-black flex items-center gap-1.5 transition-all shadow-sm border border-[#f5eedb]/40 text-xs uppercase"
            title="Cargar las fotos oficiales para la fiesta"
          >
            <Sparkle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pack Oficial Fiesta</span>
            <span className="sm:hidden">Oficial</span>
          </button>

          {!activePackName.includes('Demo') && (
            <button
              onClick={onResetToDemo}
              className="px-2.5 py-1.5 rounded-xl bg-[#14141e] hover:bg-[#1a1a28] text-amber-200/60 hover:text-white border border-[#d4af37]/30 text-xs font-vintage"
              title="Volver a las fotos de prueba para seguir desarrollando sin spoilers"
            >
              <span className="hidden sm:inline">Modo Demo</span>
              <span className="sm:hidden">Demo</span>
            </button>
          )}
        </div>
      </div>

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

      {/* TARJETA DE CONTROL Y VEREDICTO PARA EL ANFITRIÓN */}
      <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Miniatura previa de la foto */}
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/60 border-2 border-[#d4af37]/50 flex-shrink-0 flex items-center justify-center shadow-md">
          <img
            src={currentBabyPhoto.imageUrl}
            alt={`Foto ${babyPhotoIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-vintage font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Diapositiva #{babyPhotoIndex + 1}
            </span>
            {activePackName.includes('Demo') ? (
              <span className="text-xs font-vintage font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {currentBabyPhoto.category}
              </span>
            ) : (
              <span className="text-xs font-vintage font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                📸 Foto Real (Sin Spoilers)
              </span>
            )}
          </div>
          <h3 className="text-xl font-broadway text-gold-gradient">
            {activePackName.includes('Demo')
              ? currentBabyPhoto.personName
              : currentBabyPhoto.personName && !currentBabyPhoto.personName.startsWith('Foto ')
              ? currentBabyPhoto.personName
              : `Foto #${babyPhotoIndex + 1}`}
          </h3>
          <p className="text-xs font-vintage text-amber-200/80">
            🎙️ El concursante que pulse el timbre dirá su respuesta en voz alta. Indica si es correcta:
          </p>
          {activePackName.includes('Demo') && currentBabyPhoto.hint && (
            <p className="text-xs font-vintage text-amber-200/60">
              Pista demo: <span className="text-white font-semibold">{currentBabyPhoto.hint}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          <button
            onClick={onValidateBabyPhotoHit}
            className="flex-1 md:flex-none px-4 py-3 rounded-xl text-xs font-broadway font-black uppercase flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(52,211,153,0.35)]"
            title="Validar acierto del concursante que ha pulsado (+2 pts)"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Acierto (+2 pts)</span>
          </button>

          <button
            onClick={onValidateBabyPhotoMiss}
            className="flex-1 md:flex-none px-4 py-3 rounded-xl text-xs font-broadway font-black uppercase flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            title="Sancionar fallo tras pulsar (-1 pt) y reabrir timbre"
          >
            <X className="w-4 h-4 stroke-[3]" />
            <span>Fallo (-1 pt)</span>
          </button>

          <button
            onClick={onToggleBabyPhotoReveal}
            className={`px-3 py-3 rounded-xl text-xs font-vintage font-bold flex items-center justify-center gap-1.5 transition-all border ${
              babyPhotoRevealed
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#14141e] text-amber-200/60 hover:text-white border-[#d4af37]/30'
            }`}
            title="Alternar cartel de acierto en la pantalla de la TV"
          >
            {babyPhotoRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline">{babyPhotoRevealed ? 'Ocultar Cartel' : 'Mostrar Acierto'}</span>
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
