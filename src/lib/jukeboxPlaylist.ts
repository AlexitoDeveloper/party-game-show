// ============================================================================
// 🎷 SPEAKEASY JUKEBOX: CATÁLOGO Y PLAYLIST DE LOS AÑOS 20/30
// ============================================================================

export interface JukeboxTrack {
  id: string;
  title: string;
  artist: string;
  year: number;
  url: string;
}

export const JUKEBOX_PLAYLIST: JukeboxTrack[] = [
  {
    id: 'charleston_crazy',
    title: "Everybody's Charleston Crazy",
    artist: 'The Georgia Melodians',
    year: 1926,
    url: '/sounds/jukebox/charleston_crazy.mp3',
  },
  {
    id: 'charleston_ball',
    title: 'Charleston Ball',
    artist: 'The Six Jumping Jacks',
    year: 1926,
    url: '/sounds/jukebox/charleston_ball.mp3',
  },
];
