import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Cast, Zap, CheckCircle2, ExternalLink, Radio, RefreshCw, Loader2 } from 'lucide-react';
import { Modal, Button, Input } from '../ui';
import {
  pushRoomToTv,
  pushLiteModeToTv,
  getSavedHostTvPin,
  setSavedHostTvPin,
  forceResyncTv,
} from '../../lib/tvPairing';
import { getRoomSync } from '../../lib/roomSync';
import { HostTvRescueGuide } from './HostTvRescueGuide';

export interface HostTvCastModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
}

export const HostTvCastModal: React.FC<HostTvCastModalProps> = ({ isOpen, onClose, roomCode }) => {
  const [tvPin, setTvPin] = useState<string>('');
  const [liteMode, setLiteMode] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'idle' | 'sending' | 'success' | 'info'>('idle');
  const timerRef = useRef<any>(null);

  const onAckReceived = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatusType('success');
    setStatusMessage('¡TV Vinculada! Pantalla abierta en la sala');
    timerRef.current = setTimeout(() => {
      setStatusType('idle');
      setStatusMessage(null);
    }, 4500);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTvPin(getSavedHostTvPin());
      setStatusMessage(null);
      setStatusType('idle');
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !roomCode) return;
    const cleanCode = roomCode.toUpperCase().trim();
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(`wss://ntfy.sh/pgs_tv_ack_${cleanCode}/ws`);
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data.event === 'message') {
            const parsed = JSON.parse(data.message);
            if (parsed.type === 'TV_PAIR_ACK') onAckReceived();
          }
        } catch {}
      };
    } catch {}

    const roomSync = getRoomSync(cleanCode, 'host');
    const unsubRoom = roomSync.subscribe((ev) => {
      if (ev.type === 'TV_PAIR_ACK') onAckReceived();
    });

    return () => {
      if (ws) {
        try { ws.close(); } catch {}
      }
      unsubRoom();
    };
  }, [isOpen, roomCode, onAckReceived]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setTvPin(val);
    setSavedHostTvPin(val);
  };

  const handlePushRoom = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatusType('sending');
    setStatusMessage('Enviando señal a la TV...');
    pushRoomToTv(roomCode, { tvPin, liteMode });

    timerRef.current = setTimeout(() => {
      setStatusType('info');
      setStatusMessage('Señal emitida. Si la TV no cambia, revisa el PIN.');
      timerRef.current = setTimeout(() => setStatusMessage(null), 3500);
    }, 6000);
  };

  const handleToggleLiteMode = () => {
    const next = !liteMode;
    setLiteMode(next);
    pushLiteModeToTv(roomCode, next, tvPin);
    setStatusType('info');
    setStatusMessage(`Modo Ligero ${next ? 'activado' : 'desactivado'} en la TV`);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleForceResync = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatusType('sending');
    setStatusMessage('Enviando señal a la TV...');
    forceResyncTv(roomCode, tvPin);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Cast className="w-5 h-5 text-amber-400" />
          <span>Transmitir Sala a Smart TV</span>
        </div>
      }
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="bg-[#14141e] border border-[#d4af37]/30 rounded-2xl p-3 text-xs text-amber-200/80 leading-relaxed">
          Sintoniza la pantalla abriendo{' '}
          <span className="font-mono text-amber-300 font-bold bg-black/60 px-1.5 py-0.5 rounded">/tv</span> en el navegador de tu TV (LG webOS, Samsung o TCL).
        </div>

        <Input
          label="PIN de la TV (Opcional si usas Wi-Fi local)"
          helperText="Aparece en pantalla grande al abrir /tv en la tele. Se guarda en tu móvil."
          placeholder="Ej: 4829"
          maxLength={4}
          value={tvPin}
          onChange={handlePinChange}
          className="text-center font-mono text-xl tracking-widest font-black"
        />

        <Button
          variant="gold"
          size="lg"
          fullWidth
          onClick={handlePushRoom}
          disabled={statusType === 'sending'}
          className="shadow-lg shadow-amber-950/60"
        >
          {statusType === 'sending' ? (
            <Loader2 className="w-4 h-4 mr-1 text-slate-950 animate-spin" />
          ) : (
            <Radio className="w-4 h-4 mr-1 text-slate-950 animate-pulse" />
          )}
          <span>{statusType === 'sending' ? 'Sintonizando TV...' : 'Enviar Sala a TV Ahora'}</span>
        </Button>

        <div className="bg-[#12121c] border border-[#d4af37]/20 rounded-2xl p-3 flex items-center justify-between gap-3">
          <div className="min-w-0 text-left">
            <div className="text-xs font-broadway uppercase text-amber-200 flex items-center gap-1.5">
              <Zap className={`w-3.5 h-3.5 ${liteMode ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Modo Ligero OLED Remoto</span>
            </div>
            <p className="text-[11px] text-amber-200/50 mt-0.5">Elimina blurs GPU en TVs antiguas para máxima fluidez.</p>
          </div>
          <Button variant={liteMode ? 'gold' : 'secondary'} size="sm" onClick={handleToggleLiteMode} className="shrink-0 font-black min-w-[54px]">
            {liteMode ? 'ON' : 'OFF'}
          </Button>
        </div>

        <Button variant="secondary" size="md" fullWidth onClick={handleForceResync} className="border-amber-400/40 hover:border-amber-400/70">
          <RefreshCw className="w-4 h-4 mr-1 text-amber-300" />
          <span>Resincronizar Estado con la TV</span>
        </Button>

        <HostTvRescueGuide />

        <div className="pt-1 flex items-center justify-between text-xs text-amber-200/50">
          <span>¿Abriendo en la misma máquina?</span>
          <a href={`/room/${roomCode}/tv`} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:text-amber-100 flex items-center gap-1 font-broadway">
            <span>Abrir pestaña TV</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {statusMessage && (
          <div className={`p-2.5 rounded-xl border text-xs font-broadway flex items-center justify-center gap-2 animate-fade-in ${
            statusType === 'success' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
          }`}>
            {statusType === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <Loader2 className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />}
            <span>{statusMessage}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};
