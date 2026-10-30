import React, { useState, useEffect } from 'react';
import { Cast, Zap, CheckCircle2, ExternalLink, Radio, RefreshCw } from 'lucide-react';
import { Modal, Button, Input } from '../ui';
import {
  pushRoomToTv,
  pushLiteModeToTv,
  startNativePresentation,
  getSavedHostTvPin,
  setSavedHostTvPin,
  forceResyncTv,
} from '../../lib/tvPairing';
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
  const [hasPresentationApi, setHasPresentationApi] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTvPin(getSavedHostTvPin());
      setHasPresentationApi(typeof window !== 'undefined' && 'PresentationRequest' in window);
      setStatusMessage(null);
    }
  }, [isOpen]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setTvPin(val);
    setSavedHostTvPin(val);
  };

  const handlePushRoom = () => {
    pushRoomToTv(roomCode, { tvPin, liteMode });
    setStatusMessage('¡Señal transmitida a la TV con éxito!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleToggleLiteMode = () => {
    const next = !liteMode;
    setLiteMode(next);
    pushLiteModeToTv(roomCode, next, tvPin);
    setStatusMessage(`Modo Ligero ${next ? 'activado' : 'desactivado'} en la TV`);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleNativeCast = async () => {
    const success = await startNativePresentation(roomCode);
    if (success) {
      setStatusMessage('Proyección nativa iniciada en Google Cast');
    }
  };

  const handleForceResync = () => {
    forceResyncTv(roomCode, tvPin);
    setStatusMessage('¡Señal de resincronización emitida a la TV!');
    setTimeout(() => setStatusMessage(null), 3000);
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
        {/* Banner Informativo */}
        <div className="bg-[#14141e] border border-[#d4af37]/30 rounded-2xl p-3 text-xs text-amber-200/80 leading-relaxed">
          Sintoniza la pantalla de tu televisor abriendo{' '}
          <span className="font-mono text-amber-300 font-bold bg-black/60 px-1.5 py-0.5 rounded">
            /tv
          </span>{' '}
          en el navegador de tu TV (LG webOS, Samsung o TCL Android TV).
        </div>

        {/* Campo de PIN de la TV */}
        <div className="space-y-1.5">
          <Input
            label="PIN de la TV (Opcional si usas Wi-Fi local)"
            helperText="Aparece en pantalla grande al abrir /tv en la tele. Se guarda en tu móvil."
            placeholder="Ej: 4829"
            maxLength={4}
            value={tvPin}
            onChange={handlePinChange}
            className="text-center font-mono text-xl tracking-widest font-black"
          />
        </div>

        {/* Botón Principal: Enviar Sala a TV */}
        <Button
          variant="gold"
          size="lg"
          fullWidth
          onClick={handlePushRoom}
          className="shadow-lg shadow-amber-950/60"
        >
          <Radio className="w-4 h-4 mr-1 text-slate-950 animate-pulse" />
          <span>Enviar Sala a TV Ahora</span>
        </Button>

        {/* Switch / Botón de Modo Ligero OLED */}
        <div className="bg-[#12121c] border border-[#d4af37]/20 rounded-2xl p-3 flex items-center justify-between gap-3">
          <div className="min-w-0 text-left">
            <div className="text-xs font-broadway uppercase text-amber-200 flex items-center gap-1.5">
              <Zap className={`w-3.5 h-3.5 ${liteMode ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Modo Ligero OLED Remoto</span>
            </div>
            <p className="text-[11px] text-amber-200/50 mt-0.5">
              Elimina blurs GPU en TVs LG antiguas (webOS 1-3) para máxima fluidez.
            </p>
          </div>
          <Button
            variant={liteMode ? 'gold' : 'secondary'}
            size="sm"
            onClick={handleToggleLiteMode}
            className="shrink-0 font-black min-w-[54px]"
          >
            {liteMode ? 'ON' : 'OFF'}
          </Button>
        </div>

        {/* Botón de Proyección Nativa Chrome / Google Cast si está disponible */}
        {hasPresentationApi && (
          <Button variant="secondary" size="md" fullWidth onClick={handleNativeCast}>
            <Cast className="w-4 h-4 text-amber-400" />
            <span>Proyección Nativa Google Cast</span>
          </Button>
        )}

        {/* Botón de Resincronización Inmediata */}
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={handleForceResync}
          className="border-amber-400/40 hover:border-amber-400/70"
        >
          <RefreshCw className="w-4 h-4 mr-1 text-amber-300" />
          <span>Resincronizar Estado con la TV</span>
        </Button>

        {/* Guía de Rescate LG webOS & Wi-Fi */}
        <HostTvRescueGuide />

        {/* Enlace de Respaldo */}
        <div className="pt-1 flex items-center justify-between text-xs text-amber-200/50">
          <span>¿Abriendo en la misma máquina?</span>
          <a
            href={`/room/${roomCode}/tv`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 hover:text-amber-100 flex items-center gap-1 font-broadway"
          >
            <span>Abrir pestaña TV</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mensaje de Confirmación */}
        {statusMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-broadway flex items-center justify-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};
