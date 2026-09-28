import { useState } from 'react';
import { BabyPhotoItem, DEV_MOCK_BABY_PHOTOS } from '../../lib/babyPhotosData';
import { RoomSync } from '../../lib/roomSync';
import { BuzzerPressPayload, Team } from '../../lib/types';
import { TEAMS_CATALOG } from '../../lib/constants';

export interface UseHostBabyPhotosStateParams {
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

export function useHostBabyPhotosState({
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
}: UseHostBabyPhotosStateParams) {
  const [babyPhotosList, setBabyPhotosList] = useState<BabyPhotoItem[]>(() => {
    const saved = localStorage.getItem(`party_baby_photos_${roomCode}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEV_MOCK_BABY_PHOTOS;
  });
  const [activePackName, setActivePackName] = useState<string>(() => {
    return localStorage.getItem(`party_baby_photos_pack_name_${roomCode}`) || 'Modo Demo (Pruebas)';
  });
  const [babyPhotoIndex, setBabyPhotoIndex] = useState(0);
  const [babyPhotoRevealed, setBabyPhotoRevealed] = useState(false);

  const currentBabyPhoto: BabyPhotoItem =
    babyPhotosList[babyPhotoIndex % babyPhotosList.length] || babyPhotosList[0];

  const syncBabyPhotoState = (idx: number, isRev: boolean, photo?: BabyPhotoItem, total?: number) => {
    roomSync.broadcast({
      type: 'BABY_PHOTO_UPDATE',
      payload: {
        photoIndex: idx,
        isRevealed: isRev,
        photoData: photo || babyPhotosList[idx % babyPhotosList.length],
        totalPhotos: total ?? babyPhotosList.length,
      },
    });
  };

  const handleLoadOfficialPack = async () => {
    try {
      let loadedPhotos: BabyPhotoItem[] = [];

      // 1. Intentar descubrir automáticamente las imágenes en public/photos/bebes vía API de desarrollo
      try {
        const autoRes = await fetch('/api/photos-bebes');
        if (autoRes.ok) {
          const autoData = await autoRes.json();
          if (Array.isArray(autoData) && autoData.length > 0) {
            loadedPhotos = autoData;
          }
        }
      } catch {}

      // 2. Si no hay fotos vía /api/photos-bebes, intentar cargar /packs/pack_fotos_bebes_oficial.json
      if (loadedPhotos.length === 0) {
        const res = await fetch('/packs/pack_fotos_bebes_oficial.json');
        if (res.ok) {
          const rawData = await res.json();
          if (Array.isArray(rawData) && rawData.length > 0) {
            loadedPhotos = rawData.map((item: any, idx: number) => {
              if (typeof item === 'string') {
                return {
                  id: `foto_${idx + 1}`,
                  imageUrl: item,
                  personName: `Foto ${idx + 1}`,
                  category: 'Famoso' as const,
                };
              }
              return {
                id: item.id || `foto_${idx + 1}`,
                imageUrl: item.imageUrl,
                personName: item.personName || `Foto ${idx + 1}`,
                category: item.category || 'Famoso',
                hint: item.hint,
                ownerPlayerName: item.ownerPlayerName,
              };
            });
          }
        }
      }

      if (loadedPhotos.length > 0) {
        const shuffled = shuffleArray(loadedPhotos);
        setBabyPhotosList(shuffled);
        const name = `Fotos Reales Fiesta (${shuffled.length} fotos)`;
        setActivePackName(name);
        localStorage.setItem(`party_baby_photos_${roomCode}`, JSON.stringify(shuffled));
        localStorage.setItem(`party_baby_photos_pack_name_${roomCode}`, name);
        setBabyPhotoIndex(0);
        setBabyPhotoRevealed(false);
        resetBuzzer();
        syncBabyPhotoState(0, false, shuffled[0], shuffled.length);
      } else {
        alert(
          'No se encontraron imágenes en "public/photos/bebes/" ni en "/packs/pack_fotos_bebes_oficial.json".\n\nColoca tus fotos en la carpeta "public/photos/bebes/".'
        );
      }
    } catch (err) {
      alert('Error al cargar las fotos reales');
    }
  };

  const handleResetToDemo = () => {
    const shuffled = shuffleArray(DEV_MOCK_BABY_PHOTOS);
    setBabyPhotosList(shuffled);
    setActivePackName('Modo Demo (Pruebas)');
    localStorage.removeItem(`party_baby_photos_${roomCode}`);
    localStorage.removeItem(`party_baby_photos_pack_name_${roomCode}`);
    setBabyPhotoIndex(0);
    setBabyPhotoRevealed(false);
    resetBuzzer();
    syncBabyPhotoState(0, false, shuffled[0], shuffled.length);
  };

  const handleUploadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized: BabyPhotoItem[] = parsed.map((item: any, idx: number) => {
            if (typeof item === 'string') {
              return {
                id: `foto_${idx + 1}`,
                imageUrl: item,
                personName: `Foto ${idx + 1}`,
                category: 'Famoso' as const,
              };
            }
            return {
              id: item.id || `foto_${idx + 1}`,
              imageUrl: item.imageUrl,
              personName: item.personName || `Foto ${idx + 1}`,
              category: item.category || 'Famoso',
              hint: item.hint,
              ownerPlayerName: item.ownerPlayerName,
            };
          });
          setBabyPhotosList(normalized);
          const name = `Custom: ${file.name} (${normalized.length} fotos)`;
          setActivePackName(name);
          localStorage.setItem(`party_baby_photos_${roomCode}`, JSON.stringify(normalized));
          localStorage.setItem(`party_baby_photos_pack_name_${roomCode}`, name);
          setBabyPhotoIndex(0);
          setBabyPhotoRevealed(false);
          resetBuzzer();
          syncBabyPhotoState(0, false, normalized[0], normalized.length);
        } else {
          alert('El archivo no contiene un array válido de fotos');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON');
      }
    };
    reader.readAsText(file);
  };

  const handleNextBabyPhoto = () => {
    const nextIdx = (babyPhotoIndex + 1) % babyPhotosList.length;
    setBabyPhotoIndex(nextIdx);
    setBabyPhotoRevealed(false);
    resetBuzzer();
    syncBabyPhotoState(nextIdx, false);
  };

  const handlePrevBabyPhoto = () => {
    const prevIdx = (babyPhotoIndex - 1 + babyPhotosList.length) % babyPhotosList.length;
    setBabyPhotoIndex(prevIdx);
    setBabyPhotoRevealed(false);
    resetBuzzer();
    syncBabyPhotoState(prevIdx, false);
  };

  const handleToggleBabyPhotoReveal = () => {
    const nextRev = !babyPhotoRevealed;
    setBabyPhotoRevealed(nextRev);
    syncBabyPhotoState(babyPhotoIndex, nextRev);
  };

  const handleSelectBabyPhotoDirect = (idx: number) => {
    setBabyPhotoIndex(idx);
    setBabyPhotoRevealed(false);
    resetBuzzer();
    syncBabyPhotoState(idx, false);
  };

  const handleValidateBabyPhotoHit = () => {
    const targetTeam = winner?.teamId
      ? teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId)
      : selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : teams.find((t) => t.is_active);

    if (targetTeam && handleScoreChange) {
      handleScoreChange(targetTeam.id, 2);
      if (setRoundHits) {
        setRoundHits((prev) => ({
          ...prev,
          [targetTeam.id]: (prev[targetTeam.id] || 0) + 1,
        }));
      }
    }
    setBabyPhotoRevealed(true);
    if (isLocked) resetBuzzer();
    syncBabyPhotoState(babyPhotoIndex, true);
    soundFX?.playVictory();
  };

  const handleValidateBabyPhotoMiss = () => {
    const targetTeam = winner?.teamId
      ? teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId)
      : selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : teams.find((t) => t.is_active);

    if (targetTeam && handleScoreChange) {
      handleScoreChange(targetTeam.id, -1);
    }
    if (isLocked) resetBuzzer();
    soundFX?.playFail();
  };

  return {
    activePackName,
    setActivePackName,
    handleLoadOfficialPack,
    handleResetToDemo,
    handleUploadJson,
    babyPhotosList,
    setBabyPhotosList,
    babyPhotoIndex,
    setBabyPhotoIndex,
    babyPhotoRevealed,
    setBabyPhotoRevealed,
    currentBabyPhoto,
    syncBabyPhotoState,
    handleNextBabyPhoto,
    handlePrevBabyPhoto,
    handleToggleBabyPhotoReveal,
    handleSelectBabyPhotoDirect,
    handleValidateBabyPhotoHit,
    handleValidateBabyPhotoMiss,
  };
}
