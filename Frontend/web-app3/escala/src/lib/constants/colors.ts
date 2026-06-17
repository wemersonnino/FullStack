/**
 * Sistema de Cores Semânticas baseado em Teoria das Cores para Escalas
 * 
 * Cores Frias (Azul/Ciano): Estabilidade e Planejamento
 * Cores Quentes (Vermelho/Laranja): Alertas e Conflitos
 * Cores Neutras (Cinza): Pendências e Inatividade
 */
export const SHIFT_COLORS = {
  SCHEDULED: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-700',
    border: 'border-blue-500/30',
    dot: 'bg-blue-500',
  },
  PRESENTIAL: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-700',
    border: 'border-indigo-500/30',
    dot: 'bg-indigo-500',
  },
  REMOTE: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  CONFLICT: {
    bg: 'bg-red-500/10',
    text: 'text-red-700',
    border: 'border-red-500/30',
    dot: 'bg-red-500',
  },
  PENDING: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-700',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
  },
  SWAP: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-700',
    border: 'border-violet-500/30',
    dot: 'bg-violet-500',
  },
  OFF: {
    bg: 'bg-slate-100',
    text: 'text-slate-400',
    border: 'border-slate-200',
    dot: 'bg-slate-300',
  }
};
