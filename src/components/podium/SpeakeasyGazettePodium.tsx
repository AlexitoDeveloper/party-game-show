import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Newspaper } from 'lucide-react';
import { Team, Player } from '../../lib/types';
import { PowerCardsState } from '../../lib/powerCards';
import { generateAvatarDataUri } from '../../lib/dicebear';
import { triggerTeamConfetti } from '../../lib/triggerTeamConfetti';
import { soundFX } from '../../lib/audio';
import { HonorMedalsList } from './HonorMedalsList';

interface SpeakeasyGazettePodiumProps {
  teams: Team[];
  players: Player[];
  powerCards: PowerCardsState | null;
  activePage?: 'podium' | 'medals';
  onPageChange?: (page: 'podium' | 'medals') => void;
  isHost?: boolean;
  onReturnToLobby?: () => void;
}

export const SpeakeasyGazettePodium: React.FC<SpeakeasyGazettePodiumProps> = ({
  teams,
  players,
  powerCards,
  activePage: externalActivePage,
  onPageChange,
  isHost = false,
  onReturnToLobby,
}) => {
  const [internalPage, setInternalPage] = useState<'podium' | 'medals'>('podium');
  const activePage = externalActivePage ?? internalPage;

  // Clasificación oficial de la noche ordenada por puntuación descendente
  const rankedTeams = [...teams]
    .filter((t) => t.is_active)
    .sort((a, b) => b.score - a.score);

  const winner = rankedTeams[0] || teams[0];
  const winnerCaptain = players.find(
    (p) =>
      (p.team_id === winner.id ||
        (p.team_index !== undefined && p.team_index === winner.team_index)) &&
      p.is_captain
  );

  const winnerMembers = players.filter(
    (p) =>
      p.team_id === winner.id ||
      (p.team_index !== undefined && p.team_index === winner.team_index)
  );

  // Fecha conmemorativa de época
  const currentDateFormatted = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  useEffect(() => {
    // Fanfarria de victoria y confeti de gala
    soundFX.playVictory();
    triggerTeamConfetti(winner.id);
    const timer = setTimeout(() => {
      triggerTeamConfetti(winner.id);
    }, 1500);
    return () => clearTimeout(timer);
  }, [winner.id]);

  // Si no es Host (vista TV), auto-alternar cada 12 segundos entre portada y segunda plana
  useEffect(() => {
    if (isHost || externalActivePage) return;

    const interval = setInterval(() => {
      setInternalPage((prev) => (prev === 'podium' ? 'medals' : 'podium'));
    }, 12000);

    return () => clearInterval(interval);
  }, [isHost, externalActivePage]);

  const handleSelectPage = (page: 'podium' | 'medals') => {
    setInternalPage(page);
    onPageChange?.(page);
  };

  return (
    <div className="w-full max-w-5xl mx-auto h-[calc(100vh-90px)] max-h-[770px] flex flex-col items-center justify-between relative z-10 px-2 animate-in fade-in duration-700 select-none">

      {/* NAVEGACIÓN SUPERIOR SOLO PARA HOST (En TV es 100% pasivo y no se muestran botones clicables) */}
      {isHost && (
        <div className="flex items-center gap-3 mb-1.5 bg-[#120e0a]/95 border-2 border-[#8c6a21] px-4 py-1.5 rounded-2xl backdrop-blur-md shadow-md shrink-0 z-20">
          <button
            type="button"
            onClick={() => handleSelectPage('podium')}
            className={`px-3 py-1 rounded-xl text-xs font-broadway uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activePage === 'podium'
                ? 'bg-gold-gradient text-slate-950 font-black shadow-deco-gold border border-[#f5eedb]'
                : 'text-amber-200/80 hover:text-white'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>📰 Primera Plana (El Gran Golpe)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPage('medals')}
            className={`px-3 py-1 rounded-xl text-xs font-broadway uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activePage === 'medals'
                ? 'bg-gold-gradient text-slate-950 font-black shadow-deco-gold border border-[#f5eedb]'
                : 'text-amber-200/80 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>🎖️ Segunda Plana (Medallas & Infamia)</span>
          </button>

          {onReturnToLobby && (
            <button
              type="button"
              onClick={onReturnToLobby}
              className="ml-auto px-3 py-1 rounded-xl bg-[#241a10] border border-[#8c6a21]/50 text-amber-200 hover:text-white text-xs font-vintage font-bold uppercase transition-all"
            >
              ← Volver al Salón
            </button>
          )}
        </div>
      )}

      {/* PLIEGO DE PERIÓDICO RETRO 1930s (THE SPEAKEASY GAZETTE) CON TOQUES ART DÉCO */}
      <div className="w-full flex-1 flex flex-col justify-between vintage-newsprint rounded-3xl p-3.5 sm:p-4.5 relative overflow-hidden text-left border-4 border-[#2b1d10] shadow-[0_10px_40px_rgba(0,0,0,0.85)] z-10 backdrop-blur-[2px]">
        {/* ESQUINAS GEOMÉTRICAS ART DÉCO EN ORO VIEJO */}
        <div className="absolute top-1.5 left-2.5 text-xs font-broadway text-[#8c6a21] select-none tracking-widest opacity-80">
          ❖ ♠
        </div>
        <div className="absolute top-1.5 right-2.5 text-xs font-broadway text-[#8c6a21] select-none tracking-widest opacity-80">
          ♥ ❖
        </div>
        <div className="absolute bottom-1.5 left-2.5 text-xs font-broadway text-[#8c6a21] select-none tracking-widest opacity-80">
          ❖ ♣
        </div>
        <div className="absolute bottom-1.5 right-2.5 text-xs font-broadway text-[#8c6a21] select-none tracking-widest opacity-80">
          ♦ ❖
        </div>

        {/* CABECERA EDITORIAL COMPACTA Y DE IMPACTO ART DÉCO */}
        <header className="border-b-2 border-[#1a130e] pb-1.5 mb-1.5 shrink-0">
          {/* CINTILLO SUPERIOR DE EDICIÓN */}
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-vintage uppercase tracking-widest text-[#4a3520] font-bold border-b border-[#1a130e]/30 pb-0.5 mb-1">
            <span className="flex items-center gap-1">
              <span className="text-red-900 font-black">●</span> EDICIÓN EXTRAORDINARIA DE MEDIANOCHE
            </span>
            <span className="hidden sm:inline font-black text-[#8c6a21]">
              ★ THE SPEAKEASY GAZETTE • AÑO DE LA LEY SECA 1931 ★
            </span>
            <span>PRECIO: 5 CÉNTIMOS</span>
          </div>

          {/* MASTHEAD PRINCIPAL INTEGRADO EN UN SOLO RENGLÓN */}
          <div className="flex items-center justify-between py-0.5">
            {/* ALA ART DÉCO IZQUIERDA */}
            <div className="hidden md:flex items-center gap-1.5 text-[#8c6a21] text-xs font-broadway">
              <span>❖ ══</span>
              <span className="text-[9px] font-vintage uppercase text-[#5c4024] font-bold">CHICAGO & N.Y.</span>
              <span>══ ❖</span>
            </div>

            {/* TÍTULO MONUMENTAL DEL DIARIO */}
            <div className="text-center flex-1 px-2">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-broadway newsprint-ink tracking-tight uppercase scale-y-105 leading-none">
                The Speakeasy Gazette
              </h1>
            </div>

            {/* ALA ART DÉCO DERECHA CON INDICADOR DE PLANA */}
            <div className="hidden md:flex items-center gap-1.5 text-[#8c6a21] text-xs font-broadway">
              <span>❖ ══</span>
              <div className="flex items-center gap-1 bg-[#dfd4bd] border border-[#5c4024] px-2 py-0.5 rounded-full">
                <span className={`w-1.5 h-1.5 rounded-full ${activePage === 'podium' ? 'bg-[#8c6a21]' : 'bg-stone-400'}`} />
                <span className={`w-1.5 h-1.5 rounded-full ${activePage === 'medals' ? 'bg-[#8c6a21]' : 'bg-stone-400'}`} />
                <span className="text-[8px] font-broadway uppercase font-bold text-[#1a130e]">
                  {activePage === 'podium' ? 'P. 1' : 'P. 2'}
                </span>
              </div>
              <span>══ ❖</span>
            </div>
          </div>

          {/* LÍNEA EDITORIAL INFERIOR ULTRA-COMPACTA */}
          <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-vintage text-[#4a3520] border-t border-[#1a130e]/30 pt-0.5 mt-0.5 font-bold">
            <span>{currentDateFormatted.toUpperCase()}</span>
            <span className="font-broadway uppercase tracking-widest text-[#8c6a21]">
              ★ REPORTE OFICIAL DE CLAUSURA ★
            </span>
            <span>VOL. XXXIV N.º 1931</span>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL: PRIMERA O SEGUNDA PLANA */}
        <div className="w-full flex-1 flex flex-col justify-between overflow-hidden relative min-h-0">
          <AnimatePresence mode="wait">
            {activePage === 'podium' ? (
              <motion.div
                key="gazette-frontpage"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col justify-between"
              >
                {/* TITULAR PUNCHY Y ELEGANTE DE UN SOLO RENGLÓN */}
                <div className="text-center mb-1.5 shrink-0">
                  <div className="inline-flex items-center gap-2 bg-[#1a130e] text-[#f5eedb] px-3.5 py-0.5 text-[9px] sm:text-[11px] font-broadway uppercase tracking-widest rounded-sm shadow-sm">
                    <span className="text-amber-400">★ ¡GRAN GOLPE A LA BANCA!</span>
                    <span>LA CUADRILLA DE <span className="underline decoration-[#8c6a21] decoration-2">"{winner.name.toUpperCase()}"</span> SE CORONA CAMPEONA</span>
                    <span className="text-amber-400">★</span>
                  </div>
                </div>

                {/* CUERPO DEL PERIÓDICO: DOS COLUMNAS EDITORIALES */}
                <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch min-h-0">
                  {/* COLUMNA IZQUIERDA (5 COLUMNAS): CARTEL EDITORIAL DE "SE BUSCA / WANTED" CON MEDALLA 3D */}
                  <div className="md:col-span-5 flex flex-col justify-between wanted-border p-3 rounded-2xl shadow text-center relative overflow-hidden bg-[#e8dbc2]/40">
                    <div className="w-full border-b-2 border-[#3b2c1a] pb-1 mb-1">
                      <span className="text-lg sm:text-xl font-broadway uppercase tracking-widest text-[#8a1c2a] block leading-none">
                        ★ SE BUSCA ★
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-vintage uppercase tracking-widest text-stone-800 font-black block mt-0.5">
                        ENEMIGOS PÚBLICOS N.º 1 DEL SALÓN
                      </span>
                    </div>

                    {/* AVATAR DE ÉPOCA CON MEDALLA 3D THREE.JS EN LA ESQUINA */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-2xl bg-[#2a1e12] border-3 border-[#3b2c1a] shadow-inner flex items-center justify-center">
                      <img
                        src={generateAvatarDataUri(
                          winnerCaptain?.avatar_seed || winner.name,
                          (winnerCaptain?.avatar_style as any) || 'avataaars'
                        )}
                        alt={winner.name}
                        className="w-full h-full object-contain filter sepia-[0.3] contrast-125"
                      />
                      {/* SELLO DE CERA ROJA DE ÉPOCA DEL CAPITÁN */}
                      <div className="absolute -bottom-2 -right-2 bg-[#8a1c2a] text-[#f5eedb] text-[8px] sm:text-[9px] font-broadway uppercase px-2.5 py-0.5 rounded-full border-2 border-[#f5eedb] shadow-lg rotate-[-8deg] tracking-wider">
                        👑 GRAN CAPITÁN
                      </div>
                    </div>

                    {/* NOMBRE Y LIDERAZGO */}
                    <div className="mt-1">
                      <h3
                        className="text-lg sm:text-xl font-broadway uppercase tracking-wider leading-none truncate"
                        style={{ color: winner.color_hex }}
                      >
                        {winner.name}
                      </h3>
                      {winnerCaptain && (
                        <span className="text-[10px] font-editorial text-stone-700 italic block mt-0.5 truncate">
                          Liderados por "{winnerCaptain.nickname}"
                        </span>
                      )}
                    </div>

                    {/* PLACA DE RECOMPENSA EN DÓLARES */}
                    <div className="w-full mt-1 pt-1 border-t-2 border-dashed border-[#3b2c1a]/60 bg-[#e4d6be]/70 rounded-xl p-1.5">
                      <span className="text-[8px] font-vintage uppercase tracking-widest text-stone-700 block font-bold">
                        RECOMPENSA OFICIAL DE LA NOCHE
                      </span>
                      <span className="text-xl sm:text-2xl font-broadway newsprint-ink block font-black text-[#7a5917] leading-tight">
                        ${(winner.score * 1000).toLocaleString()} DÓLARES
                      </span>
                      <span className="text-[8px] font-vintage text-stone-600 block uppercase tracking-wider">
                        ({winner.score} Puntos de Botín Acumulados)
                      </span>
                    </div>

                    {/* INTEGRANTES DE LA CUADRILLA */}
                    <div className="w-full mt-1 pt-1 border-t border-[#3b2c1a]/30">
                      <span className="text-[8px] font-vintage uppercase tracking-wider text-stone-700 font-bold block mb-1">
                        Cómplices de la Cuadrilla:
                      </span>
                      <div className="flex flex-wrap justify-center gap-1 max-h-10 overflow-y-auto">
                        {winnerMembers.map((m) => (
                          <span
                            key={m.id}
                            className="text-[8px] font-vintage font-bold px-1.5 py-0.5 rounded bg-black/10 text-stone-900 border border-stone-400 truncate max-w-[90px]"
                          >
                            {m.nickname}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* COLUMNA DERECHA (7 COLUMNAS): TABLA CLASIFICATORIA DE BOTÍN */}
                  <div className="md:col-span-7 flex flex-col justify-between bg-[#f0e7d3] border-2 border-[#3b2c1a] p-3 rounded-2xl shadow">
                    <div>
                      <div className="border-b-2 border-[#1a130e] pb-1 mb-1.5 flex items-center justify-between">
                        <h3 className="text-sm sm:text-base font-broadway uppercase newsprint-ink tracking-wider flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-[#8c6a21]" />
                          <span>Clasificación del Veredicto Final</span>
                        </h3>
                        <span className="text-[8px] sm:text-[9px] font-vintage uppercase tracking-wider text-stone-700 font-bold">
                          {rankedTeams.length} Cuadrillas
                        </span>
                      </div>

                      {/* LISTADO EDITORIAL ESCALONADO (TOP 5) */}
                      <div className="space-y-1 sm:space-y-1.5">
                        {rankedTeams.slice(0, 5).map((team, idx) => {
                          const isChampion = idx === 0;
                          const isSecond = idx === 1;
                          const isThird = idx === 2;

                          return (
                            <div
                              key={team.id}
                              className={`p-1.5 sm:p-2 rounded-xl border-2 flex items-center justify-between transition-all ${
                                isChampion
                                  ? 'bg-[#e2d5ba] border-[#8c6a21] shadow-sm'
                                  : isSecond
                                  ? 'bg-[#eae0ca] border-stone-400'
                                  : isThird
                                  ? 'bg-[#eae0ca] border-amber-900/40'
                                  : 'bg-[#f5eedb] border-stone-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {/* SELLO DE MEDALLA EDITORIAL */}
                                <div
                                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center font-broadway text-xs font-black border shadow-sm ${
                                    isChampion
                                      ? 'bg-[#8c6a21] text-white border-[#3b2c1a]'
                                      : isSecond
                                      ? 'bg-stone-500 text-white border-stone-700'
                                      : isThird
                                      ? 'bg-amber-800 text-white border-amber-950'
                                      : 'bg-stone-300 text-stone-800 border-stone-400'
                                  }`}
                                >
                                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`}
                                </div>

                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full border border-black/30 shrink-0"
                                      style={{ backgroundColor: team.color_hex }}
                                    />
                                    <h4 className="text-xs sm:text-sm font-broadway uppercase newsprint-ink tracking-wide truncate max-w-[170px] sm:max-w-[240px]">
                                      {team.name}
                                    </h4>
                                  </div>
                                  <span className="text-[8px] sm:text-[9px] font-editorial text-stone-700 italic block leading-none">
                                    {isChampion
                                      ? 'Campeones del Show'
                                      : isSecond
                                      ? 'Subcampeones de Honor'
                                      : isThird
                                      ? 'Tercer Puesto en la Mesa'
                                      : 'Fieles Concursantes'}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-base sm:text-xl font-broadway newsprint-ink block font-black leading-none">
                                  {team.score}
                                </span>
                                <span className="text-[7px] sm:text-[8px] font-vintage uppercase text-stone-600 tracking-wider block">
                                  Puntos
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* CITA EDITORIAL Y FIRMA AL PIE */}
                    <div className="mt-1.5 pt-1.5 border-t-2 border-[#1a130e]/30 flex items-center justify-between text-[9px] font-editorial text-stone-800 italic">
                      <span className="truncate max-w-[320px]">"La Ley Seca caerá con el tiempo, pero el honor permanecerá."</span>
                      <span className="font-broadway uppercase text-[#8c6a21] font-bold not-italic shrink-0">
                        Consorcio Clandestino
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* SEGUNDA PLANA: MEDALLAS Y SALÓN DE LA INFAMIA */
              <motion.div
                key="gazette-medals"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col justify-between"
              >
                <HonorMedalsList teams={teams} players={players} powerCards={powerCards} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PIE DE IMPRENTA EDITORIAL */}
        <footer className="shrink-0 pt-1 border-t-2 border-[#1a130e]/40 flex items-center justify-between text-[8px] sm:text-[9px] font-vintage uppercase text-[#4a3520] font-bold mt-1">
          <span>♠ The Speakeasy Gazette Press • 1931</span>
          <span className="font-broadway text-[#8c6a21] hidden sm:inline">★ ★ ★ ★ ★</span>
          <span>♦ Veredicto Inapelable del Tribunal</span>
        </footer>
      </div>
    </div>
  );
};

export default SpeakeasyGazettePodium;
