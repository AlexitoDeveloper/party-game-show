export default async function handler(req: any, res: any) {
  const { id } = req.query;
  const playlistId = Array.isArray(id) ? id[0] : id;

  if (!playlistId) {
    res.status(400).json({ error: 'Falta playlistId' });
    return;
  }

  try {
    const embedRes = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!embedRes.ok) {
      res.status(embedRes.status).json({ error: 'No se pudo cargar la playlist desde Spotify Embed' });
      return;
    }

    const html = await embedRes.text();
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
    if (!nextDataMatch) {
      res.status(404).json({ error: 'No se encontraron datos en el embed de la playlist' });
      return;
    }

    const parsed = JSON.parse(nextDataMatch[1]);
    const entity = parsed.props?.pageProps?.state?.data?.entity;
    if (!entity) {
      res.status(404).json({ error: 'Playlist no encontrada o es privada' });
      return;
    }

    const playlistName = entity.name || 'Playlist de Spotify';
    const playlistCover = entity.visualIdentity?.image?.[1]?.url || entity.visualIdentity?.image?.[0]?.url || '';
    const rawTracks = entity.trackList || [];

    const tracks = rawTracks.map((t: any) => {
      const trackId = t.uri ? t.uri.replace('spotify:track:', '') : t.uid || Math.random().toString(36).substring(2, 9);
      const title = t.title || 'Canción';
      const artist = t.subtitle || 'Varios';
      const previewUrl = t.audioPreview?.url || '';
      return {
        id: `spotify_${trackId}`,
        title,
        artist,
        previewUrl,
        coverUrl: playlistCover,
        duration: t.duration || 180000,
      };
    });

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).json({
      playlistName,
      playlistCover,
      tracks,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
