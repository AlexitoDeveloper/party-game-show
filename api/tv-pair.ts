interface TvPairingItem {
  roomCode: string;
  tvPin?: string;
  liteMode?: boolean;
  title?: string;
  ts: number;
}

const memoryPairings: TvPairingItem[] = [];

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const now = Date.now();
  while (memoryPairings.length > 0 && now - memoryPairings[0].ts > 60000) {
    memoryPairings.shift();
  }

  if (req.method === 'POST') {
    try {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      if (data.roomCode) {
        memoryPairings.push({
          roomCode: String(data.roomCode).toUpperCase().trim(),
          tvPin: data.tvPin ? String(data.tvPin).trim() : undefined,
          liteMode: typeof data.liteMode === 'boolean' ? data.liteMode : undefined,
          title: data.title ? String(data.title) : undefined,
          ts: Number(data.ts) || Date.now(),
        });
        if (memoryPairings.length > 50) memoryPairings.shift();
      }
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({ ok: true });
    } catch {
      res.status(400).json({ error: 'Cuerpo inválido' });
    }
    return;
  }

  if (req.method === 'GET') {
    const pin = (req.query?.pin || '').trim();
    const match = [...memoryPairings].reverse().find((p) => {
      if (pin && p.tvPin) return p.tvPin === pin;
      if (pin && !p.tvPin) return true;
      if (!pin) return true;
      return false;
    });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ ok: true, pairing: match || null, ...(match || {}) });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
