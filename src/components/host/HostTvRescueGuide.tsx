import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Clock, Globe, Wifi, ShieldAlert } from 'lucide-react';
import { Button } from '../ui';

export const HostTvRescueGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[#d4af37]/30 rounded-2xl bg-[#0e0e16] overflow-hidden text-left">
      <Button
        variant="ghost"
        size="sm"
        fullWidth
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between px-3.5 py-2.5 text-xs text-amber-200/90 hover:bg-amber-500/10 font-broadway uppercase tracking-wide"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>¿La TV no conecta o falla el Wi-Fi?</span>
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-400 shrink-0" />
        )}
      </Button>

      {isOpen && (
        <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 text-[11px] font-vintage text-amber-200/80 border-t border-[#d4af37]/15">
          <p className="text-[10px] uppercase font-broadway text-amber-400 tracking-wider">
            Protocolo de Rescate Pixel 10 Pro + LG OLED webOS:
          </p>

          <div className="flex items-start gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-200 font-bold block">1. Fecha y Hora manual en LG</strong>
              <span>Ajustes &gt; General &gt; Fecha y Hora &gt; Desactivar "Automático". Evita el bloqueo de certificados SSL tras apagones.</span>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
            <Globe className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-200 font-bold block">2. Desactivar IPv6 y usar DNS 8.8.8.8</strong>
              <span>En Ajustes de Red de la LG, apaga IPv6 y configura manualmente el Servidor DNS en <code className="text-amber-300 font-mono">8.8.8.8</code>.</span>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
            <Wifi className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-200 font-bold block">3. Hotspot Pixel en 2.4 GHz</strong>
              <span>En el Pixel 10 Pro, activa <em>"Ampliar compatibilidad"</em> en Zona Wi-Fi para que las tarjetas de red de TVs antiguas detecten la señal.</span>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-200 font-bold block">4. Entrada por http:// (sin S)</strong>
              <span>Si webOS 2015 bloquea la conexión por certificado caducado, escribe directamente <code className="text-amber-300 font-mono">http://</code> en el navegador de la TV.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
