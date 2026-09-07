export default async function handler(req: any, res: any) {
  const { id } = req.query;
  const trackId = Array.isArray(id) ? id[0] : id;

  if (!trackId) {
    res.status(400).json({ error: 'Falta trackId' });
    return;
  }

  try {
    const embedRes = await fetch(`https://open.spotify.com/embed/track/${trackId}`);
    const text = await embedRes.text();
    const jsonMatch = text.match(/"audioPreview":\{"url":"([^"]+)"\}/);
    const cdnMatch = text.match(/https:\/\/p\.scdn\.co\/mp3-preview\/[a-zA-Z0-9]+/);
    const previewUrl = jsonMatch && jsonMatch[1] ? jsonMatch[1].replace(/\\u0026/g, '&') : cdnMatch ? cdnMatch[0] : '';

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).json({ previewUrl });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
