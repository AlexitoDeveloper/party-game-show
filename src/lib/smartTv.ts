/**
 * Módulo de detección y optimizaciones de rendimiento para Smart TVs (LG webOS, Samsung Tizen, TCL, etc.)
 */

const STORAGE_KEY = 'party_tv_lite_mode';

/**
 * Detecta si el navegador actual se ejecuta en una Smart TV o dispositivo TV dongle.
 */
export function isSmartTvBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Web0S|webOS|NetCast|SmartTV|LGE|Tizen|BRAVIA|TCL|Android TV|AFT/i.test(ua);
}

/**
 * Detecta si el navegador es un webOS antiguo o un motor Chromium legado (versiones 30 a 69)
 * característico de TVs como LG OLED/LCD 2014-2018.
 */
export function isLegacyWebOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Web0S|NetCast/i.test(ua) || /Chrome\/[3-6][0-9]\./i.test(ua);
}

/**
 * Obtiene el estado actual del Modo Ligero OLED/Smart TV.
 * Por defecto es true si se detecta un televisor con motor heredado o si se activó manualmente.
 */
export function getTvLiteMode(): boolean {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) {
    return saved === 'true';
  }
  const path = window.location?.pathname || '';
  const isTvRoute = path === '/tv' || path.endsWith('/tv');
  return isTvRoute || isSmartTvBrowser() || isLegacyWebOS();
}

/**
 * Activa o desactiva el Modo Ligero OLED/Smart TV y aplica la clase CSS en el documento.
 */
export function setTvLiteMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch (err) {
    console.warn('No se pudo guardar la preferencia de lite mode en localStorage:', err);
  }

  if (typeof document !== 'undefined') {
    if (enabled) {
      document.documentElement.classList.add('tv-lite-mode');
    } else {
      document.documentElement.classList.remove('tv-lite-mode');
    }
  }
}

/**
 * Inicializa el Modo Ligero aplicando la clase CSS según el valor guardado o detectado.
 * Llamar en el arranque de la app o al montar vistas TV.
 */
export function initTvLiteMode(): boolean {
  const isLite = getTvLiteMode();
  if (typeof document !== 'undefined') {
    if (isLite) {
      document.documentElement.classList.add('tv-lite-mode');
    } else {
      document.documentElement.classList.remove('tv-lite-mode');
    }
  }
  return isLite;
}
