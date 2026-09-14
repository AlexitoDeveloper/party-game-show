export default async function handler(req: any, res: any) {
  const clientId = process.env.SPOTIFY_CLIENT_ID || process.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || process.env.VITE_SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(500).json({ error: 'Credenciales de Spotify no configuradas en el servidor' });
    return;
  }

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      res.status(tokenRes.status).json({ error: 'Error autenticando con Spotify', details: errText });
      return;
    }

    const data = await tokenRes.json();
    res.setHeader('Cache-Control', 's-maxage=3000, stale-while-revalidate');
    res.status(200).json({
      access_token: data.access_token,
      expires_in: data.expires_in,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
