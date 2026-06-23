export enum EscalaRole {
  ADMIN = 'ADMIN',
  FUNCIONARIO = 'FUNCIONARIO',
  USER = 'USER',
  MEMBER = 'MEMBER',
}

export type EscalaViewMode = 'month' | 'week' | 'year';

export type Escala = {
  id: string;
  usuarioId: string;
  nomeUsuario: string;
  avatarUrl?: string | null;
  cargo?: string | null;
  email?: string | null;
  role?: string | null;
  dataInicio: string;
  data?: string;
  dataFim?: string | null;
  horarioInicio?: string | null;
  startTime?: string | null;
  horarioFim?: string | null;
  endTime?: string | null;
  setorId?: string | null;
  setor?: string | null;
  setorNome?: string | null;
  projetoId?: string | null;
  projeto?: string | null;
  projetoNome?: string | null;
  empresaId?: string | null;
  empresaNome?: string | null;
  local?: string | null;
  remoto?: boolean;
  workMode?: 'PRESENCIAL' | 'REMOTO';
  observacao?: string | null;
  status?: string | null;
  criadoPor?: string | null;
  criadoEm?: string | null;
  atualizadoEm?: string | null;
  version?: number;
};

export type UsuarioEscala = {
  id: string;
  nome: string;
  username?: string | null;
  email: string;
  avatarUrl?: string | null;
  cargo?: string | null;
  departamento?: string | null;
  role: string;
  telefone?: string | null;
  remoto?: boolean;
  tipoVinculo?: string | null;
  empresaId?: string | null;
  empresaNome?: string | null;
  projetoId?: string | null;
  projetoNome?: string | null;
  setorId?: string | null;
  setorNome?: string | null;
};

export type EscalaFilters = {
  inicio?: string;
  fim?: string;
  usuarioId?: string;
  setorId?: string;
  projetoId?: string;
  setor?: string;
  projeto?: string;
  viewMode?: EscalaViewMode;
  year?: number;
  month?: number;
};

export type CriarEscalaPayload = {
  usuarioId: string;
  empresaId?: string;
  setorId?: string;
  projetoId?: string;
  datas: string[];
  horarioInicio: string;
  horarioFim: string;
  setor?: string;
  projeto?: string;
  local?: string;
  remoto?: boolean;
  observacao?: string;
  version?: number;
};

export type AtualizarEscalaPayload = Partial<CriarEscalaPayload> & {
  id: string;
};

export type SessionLikeUser = {
  id?: string | number | null;
  email?: string | null;
  roles?: string[] | null;
};
