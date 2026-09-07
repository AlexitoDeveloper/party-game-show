import React from 'react';
import { Droplets, Flame, Zap, Sparkles, Moon, Orbit, Sun, LucideIcon } from 'lucide-react';

export interface TeamTheme {
  index: number;
  name: string;
  theme: string;
  colorName: string;
  emoji: string;
  // Core colors
  primaryHex: string;
  accentHex: string;
  surfaceHex: string;
  glowColor: string;
  accentRgb: string;
  // Tailwind utility classes
  twBg: string;
  twBorder: string;
  twText: string;
  twContrastText: string;
  // Gradients and visual effects
  gradient: string;
  beamGradient: string; // Conic gradient colors for BorderBeam
  lobbyBorderClass: string;
  // Confetti explosion colors
  confettiColors: string[];
  // Badge styling
  badge: {
    emoji: string;
    label: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
  };
  // Icon reference
  icon: LucideIcon;
}

export const TEAM_THEMES: Record<number, TeamTheme> = {
  1: {
    index: 1,
    name: 'Agua',
    theme: 'Agua',
    colorName: 'Azul',
    emoji: '💧',
    primaryHex: '#3B82F6',
    accentHex: '#60A5FA',
    surfaceHex: '#1E3A8A',
    glowColor: 'rgba(59, 130, 246, 0.45)',
    accentRgb: '59, 130, 246',
    twBg: 'bg-blue-500',
    twBorder: 'border-blue-500',
    twText: 'text-blue-400',
    twContrastText: 'text-white',
    gradient: 'from-blue-600 via-blue-500 to-cyan-500',
    beamGradient: 'from-blue-500 via-cyan-400 to-blue-600',
    lobbyBorderClass: 'lobby-border-agua',
    confettiColors: ['#3B82F6', '#60A5FA', '#06B6D4', '#93C5FD'],
    badge: {
      emoji: '💧',
      label: 'AGUA',
      textColor: 'text-cyan-300',
      bgColor: 'bg-cyan-950/80',
      borderColor: 'border-cyan-500/40',
    },
    icon: Droplets,
  },
  2: {
    index: 2,
    name: 'Fuego',
    theme: 'Fuego',
    colorName: 'Rojo',
    emoji: '🔥',
    primaryHex: '#EF4444',
    accentHex: '#F87171',
    surfaceHex: '#7F1D1D',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    accentRgb: '239, 68, 68',
    twBg: 'bg-red-500',
    twBorder: 'border-red-500',
    twText: 'text-red-400',
    twContrastText: 'text-white',
    gradient: 'from-red-600 via-red-500 to-amber-600',
    beamGradient: 'from-red-500 via-orange-400 to-amber-500',
    lobbyBorderClass: 'lobby-border-fuego',
    confettiColors: ['#EF4444', '#F87171', '#F97316', '#FDE047'],
    badge: {
      emoji: '🔥',
      label: 'FUEGO',
      textColor: 'text-red-300',
      bgColor: 'bg-red-950/80',
      borderColor: 'border-red-500/40',
    },
    icon: Flame,
  },
  3: {
    index: 3,
    name: 'Electricidad',
    theme: 'Electricidad',
    colorName: 'Amarillo',
    emoji: '⚡',
    primaryHex: '#EAB308',
    accentHex: '#FDE047',
    surfaceHex: '#713F12',
    glowColor: 'rgba(234, 179, 8, 0.45)',
    accentRgb: '234, 179, 8',
    twBg: 'bg-yellow-500',
    twBorder: 'border-yellow-400',
    twText: 'text-yellow-400',
    twContrastText: 'text-zinc-950', // Alto contraste oscuro obligatorio para amarillo
    gradient: 'from-yellow-500 via-amber-400 to-orange-400',
    beamGradient: 'from-yellow-400 via-amber-300 to-yellow-500',
    lobbyBorderClass: 'lobby-border-electricidad',
    confettiColors: ['#EAB308', '#FDE047', '#FEF08A', '#F59E0B'],
    badge: {
      emoji: '⚡',
      label: 'ELECTRICIDAD',
      textColor: 'text-yellow-200',
      bgColor: 'bg-yellow-950/80',
      borderColor: 'border-yellow-400/50',
    },
    icon: Zap,
  },
  4: {
    index: 4,
    name: 'Luz',
    theme: 'Luz',
    colorName: 'Blanco',
    emoji: '✨',
    primaryHex: '#FFFFFF',
    accentHex: '#F8FAFC',
    surfaceHex: '#334155',
    glowColor: 'rgba(255, 255, 255, 0.65)',
    accentRgb: '255, 255, 255',
    twBg: 'bg-white',
    twBorder: 'border-slate-200',
    twText: 'text-slate-100',
    twContrastText: 'text-zinc-950', // Alto contraste oscuro sobre fondo blanco
    gradient: 'from-slate-200 via-white to-slate-300',
    beamGradient: 'from-white via-slate-200 to-cyan-100',
    lobbyBorderClass: 'lobby-border-luz',
    confettiColors: ['#FFFFFF', '#E2E8F0', '#94A3B8', '#F8FAFC'],
    badge: {
      emoji: '✨',
      label: 'LUZ',
      textColor: 'text-slate-100',
      bgColor: 'bg-slate-800/90',
      borderColor: 'border-white/50',
    },
    icon: Sparkles,
  },
  5: {
    index: 5,
    name: 'Sombra',
    theme: 'Sombra',
    colorName: 'Negro',
    emoji: '🌑',
    primaryHex: '#18181B', // Superficie oscura elegante
    accentHex: '#94A3B8',  // Acento plata metálico para destacar en oscuridad
    surfaceHex: '#09090B',
    glowColor: 'rgba(148, 163, 184, 0.35)',
    accentRgb: '148, 163, 184',
    twBg: 'bg-zinc-900',
    twBorder: 'border-zinc-500',
    twText: 'text-zinc-200',
    twContrastText: 'text-white',
    gradient: 'from-zinc-800 via-zinc-900 to-black',
    beamGradient: 'from-zinc-400 via-slate-300 to-zinc-600',
    lobbyBorderClass: 'lobby-border-sombra',
    confettiColors: ['#94A3B8', '#64748B', '#CBD5E1', '#475569'],
    badge: {
      emoji: '🌑',
      label: 'SOMBRA',
      textColor: 'text-zinc-200',
      bgColor: 'bg-zinc-900/90',
      borderColor: 'border-zinc-500/50',
    },
    icon: Moon,
  },
  6: {
    index: 6,
    name: 'Ácido',
    theme: 'Ácido',
    colorName: 'Verde',
    emoji: '🧪',
    primaryHex: '#22C55E',
    accentHex: '#4ADE80',
    surfaceHex: '#14532D',
    glowColor: 'rgba(34, 197, 94, 0.45)',
    accentRgb: '34, 197, 94',
    twBg: 'bg-green-500',
    twBorder: 'border-green-500',
    twText: 'text-green-400',
    twContrastText: 'text-zinc-950',
    gradient: 'from-emerald-600 via-green-500 to-lime-400',
    beamGradient: 'from-green-500 via-lime-400 to-emerald-500',
    lobbyBorderClass: 'lobby-border-acido',
    confettiColors: ['#22C55E', '#4ADE80', '#84CC16', '#A3E635'],
    badge: {
      emoji: '🧪',
      label: 'ÁCIDO',
      textColor: 'text-green-300',
      bgColor: 'bg-green-950/80',
      borderColor: 'border-green-500/40',
    },
    icon: Sparkles,
  },
  7: {
    index: 7,
    name: 'Galaxia',
    theme: 'Galaxia',
    colorName: 'Morado',
    emoji: '🌌',
    primaryHex: '#A855F7',
    accentHex: '#C084FC',
    surfaceHex: '#581C87',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    accentRgb: '168, 85, 247',
    twBg: 'bg-purple-500',
    twBorder: 'border-purple-500',
    twText: 'text-purple-400',
    twContrastText: 'text-white',
    gradient: 'from-purple-600 via-fuchsia-500 to-pink-500',
    beamGradient: 'from-purple-500 via-pink-400 to-fuchsia-500',
    lobbyBorderClass: 'lobby-border-galaxia',
    confettiColors: ['#A855F7', '#C084FC', '#E879F9', '#DDD6FE'],
    badge: {
      emoji: '🌌',
      label: 'GALAXIA',
      textColor: 'text-purple-300',
      bgColor: 'bg-purple-950/80',
      borderColor: 'border-purple-500/40',
    },
    icon: Orbit,
  },
  8: {
    index: 8,
    name: 'Magma',
    theme: 'Magma',
    colorName: 'Naranja',
    emoji: '🌋',
    primaryHex: '#F97316',
    accentHex: '#FB923C',
    surfaceHex: '#7C2D12',
    glowColor: 'rgba(249, 115, 22, 0.45)',
    accentRgb: '249, 115, 22',
    twBg: 'bg-orange-500',
    twBorder: 'border-orange-500',
    twText: 'text-orange-400',
    twContrastText: 'text-white',
    gradient: 'from-orange-600 via-amber-600 to-red-600',
    beamGradient: 'from-orange-500 via-amber-400 to-red-500',
    lobbyBorderClass: 'lobby-border-magma',
    confettiColors: ['#F97316', '#FB923C', '#F59E0B', '#EF4444'],
    badge: {
      emoji: '🌋',
      label: 'MAGMA',
      textColor: 'text-orange-300',
      bgColor: 'bg-orange-950/80',
      borderColor: 'border-orange-500/40',
    },
    icon: Sun,
  },
};

export function getTeamTheme(teamIndex: number): TeamTheme {
  return TEAM_THEMES[teamIndex] || TEAM_THEMES[1];
}
