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
  const [babyPhotoIndex, setBabyPhotoIndex] = useState(0);
  const [babyPhotoRevealed, setBabyPhotoRevealed] = useState(false);

  const currentBabyPhoto: BabyPhotoItem =
    babyPhotosList[babyPhotoIndex % babyPhotosList.length] || babyPhotosList[0];

  const syncBabyPhotoState = (idx: number, isRev: boolean, photo?: BabyPhotoItem) => {
    roomSync.broadcast({
      type: 'BABY_PHOTO_UPDATE',
      payload: {
        photoIndex: idx,
        isRevealed: isRev,
        photoData: photo || babyPhotosList[idx % babyPhotosList.length],
      },
    });
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
