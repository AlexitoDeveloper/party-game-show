import React from 'react';
import { Award, Zap, Skull, Shield, TrendingUp, Flame, Star, Crown } from 'lucide-react';
import { Team, Player } from '../../lib/types';
import { PowerCardsState } from '../../lib/powerCards';

export interface HonorAward {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badgeEmoji: string;
  cardSuit: string;
  accentColor: string;
  winnerTeamName: string;
  winnerColorHex: string;
  statBadge: string;
}

interface HonorMedalsListProps {
  teams: Team[];
  players: Player[];
  powerCards: PowerCardsState | null;
}

export const HonorMedalsList: React.FC<HonorMedalsListProps> = ({
  teams,
  players,
}) => {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0] || teams[0];
  const runnerUp = sortedTeams[1] || teams[0];
  const thirdPlace = sortedTeams[2] || teams[0];
  const lastPlace = sortedTeams[sortedTeams.length - 1] || teams[0];

  const awards: HonorAward[] = [
    {
      id: 'fastest_finger',
      title: 'El Dedo Más Rápido de Chicago',
      subtitle: 'REFLEJOS DE PISTOLERO',
      description: 'Velocidad de rayo en el pulsador de bronce ante los desafíos de rapidez.',
      badgeEmoji: '⚡',
      cardSuit: '♠',
      accentColor: '#8c6a21',
      winnerTeamName: runnerUp ? runnerUp.name : winner.name,
      winnerColorHex: runnerUp ? runnerUp.color_hex : winner.color_hex,
      statBadge: 'Reacción Relámpago',
    },
    {
      id: 'most_wanted_gangster',
      title: 'El Gángster Más Buscado',
      subtitle: 'MAESTRO DEL SABOTAJE',
      description: 'La cuadrilla más temida de la noche: mayor despliegue de cartas trampa y extorsión.',
      badgeEmoji: '🃏',
      cardSuit: '♣',
      accentColor: '#6b21a8',
      winnerTeamName: thirdPlace ? thirdPlace.name : winner.name,
      winnerColorHex: thirdPlace ? thirdPlace.color_hex : winner.color_hex,
      statBadge: 'As de la Trampa',
    },
    {
      id: 'the_untouchables',
      title: 'Los Intocables de Eliot Ness',
      subtitle: 'DEFENSA DE HIERRO',
      description: 'Resistencia impenetrable: mantuvieron la sangre fría ante los ataques rivales.',
      badgeEmoji: '🛡️',
      cardSuit: '♦',
      accentColor: '#0369a1',
      winnerTeamName: winner.name,
      winnerColorHex: winner.color_hex,
      statBadge: 'Blindaje Total',
    },
    {
      id: 'great_escape',
      title: 'El Gran Golpe (La Remontada)',
      subtitle: 'ESPÍRITU COMBATIVO',
      description: 'Batallaron cada ficha de la partida hasta el último compás de la velada.',
      badgeEmoji: '📈',
      cardSuit: '♥',
      accentColor: '#047857',
      winnerTeamName: lastPlace ? lastPlace.name : winner.name,
      winnerColorHex: lastPlace ? lastPlace.color_hex : winner.color_hex,
      statBadge: 'Pundonor Imparable',
    },
    {
      id: 'high_roller',
      title: 'El Temerario de la Ley Seca',
      subtitle: 'APUESTA AL LÍMITE',
      description: 'Todo o nada: audacia sin límites arriesgando su botín en los momentos clave.',
      badgeEmoji: '🎰',
      cardSuit: '♠',
      accentColor: '#be123c',
      winnerTeamName: winner.name,
      winnerColorHex: winner.color_hex,
      statBadge: 'Corazón de Tahúr',
    },
  ];

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-1">
      {/* CABECERA EDITORIAL COMPACTA: SEGUNDA PLANA Y CRÓNICA DE INFAMIA */}
      <div className="text-center mb-1.5 shrink-0">
        <div className="inline-flex items-center gap-2 bg-[#1a130e] text-[#f5eedb] px-3 py-0.5 text-[9px] sm:text-[10px] font-broadway uppercase tracking-widest rounded-sm shadow-sm">
          <span>🎖️ SEGUNDA PLANA: SALÓN DE LA INFAMIA & CONDECORACIONES DE HONOR 🎖️</span>
        </div>
        <p className="text-[10px] font-editorial text-stone-700 italic mt-0.5">
          "El tribunal clandestino otorga las condecoraciones a los comportamientos más memorables de la noche"
        </p>
      </div>

      {/* GRID COMPACTO DE MEDALLAS / PLACAS EDITORIALES DE PAPEL PERIÓDICO */}
      <div className="grid grid-cols-5 gap-2.5 my-auto">
        {awards.map((award) => (
          <div
            key={award.id}
            className="relative bg-[#eee4ce] border-2 border-[#3b2c1a] rounded-2xl p-3 flex flex-col justify-between shadow-md transition-all overflow-hidden"
          >
            {/* MARCA DE AGUA DEL NAIPE */}
            <div className="absolute -right-2 -bottom-4 text-6xl font-editorial text-[#3b2c1a]/10 pointer-events-none select-none">
              {award.cardSuit}
            </div>

            <div>
              {/* CABECERA DE LA PLACA */}
              <div className="flex items-center justify-between mb-1 border-b border-[#3b2c1a]/30 pb-1">
                <div className="w-7 h-7 rounded-xl bg-[#dfd3ba] border border-[#3b2c1a]/60 flex items-center justify-center text-sm shadow-sm">
                  {award.badgeEmoji}
                </div>
                <span className="text-[9px] font-broadway text-[#3b2c1a] font-bold px-1.5 py-0.5 rounded bg-[#e2d5bb] border border-[#3b2c1a]/30">
                  {award.cardSuit} {award.statBadge}
                </span>
              </div>

              <span className="text-[8px] font-vintage uppercase tracking-wider text-[#8c6a21] font-black block">
                {award.subtitle}
              </span>
              <h4 className="text-xs font-broadway newsprint-ink tracking-wide leading-tight mt-0.5 line-clamp-2">
                {award.title}
              </h4>

              <p className="text-[10px] font-editorial text-stone-700 leading-snug my-1.5 line-clamp-2">
                {award.description}
              </p>
            </div>

            {/* PIE DE EQUIPO PREMIADO */}
            <div className="pt-1.5 border-t border-[#3b2c1a]/30 flex items-center justify-between bg-[#e5d9bf] -mx-3 -mb-3 p-2 rounded-b-xl">
              <span className="text-[9px] font-vintage uppercase text-stone-700 font-bold">
                Galardonado:
              </span>
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: award.winnerColorHex }}
                />
                <span className="text-xs font-broadway newsprint-ink uppercase truncate max-w-[100px] font-black">
                  {award.winnerTeamName}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PIE DECORATIVO DE PRENSA HISTÓRICA */}
      <div className="text-center pt-2 border-t border-[#3b2c1a]/30 text-[10px] font-editorial italic text-stone-700">
        "En esta casa de juego, quien arriesga su honor pasa a la posteridad de la Ley Seca."
      </div>
    </div>
  );
};

export default HonorMedalsList;
