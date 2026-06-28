export interface Escala {
  id: string;
  usuarioId: string;
  nomeUsuario: string;
  avatarUrl?: string;
  cargo?: string;
  email?: string;
  role?: string;
  data: string; // ISO date
  horarioInicio: string; // HH:mm
  horarioFim: string; // HH:mm
  setor?: string;
  projeto?: string;
  local?: string;
  remoto: boolean;
  status: string;
  workMode: 'PRESENCIAL' | 'REMOTO';
  observacao?: string;
}

export interface EscalaRequest {
  employeeId: string;
  dates: string[];
  startTime: string;
  endTime: string;
  workMode: 'PRESENCIAL' | 'REMOTO';
  notes?: string;
  companyId?: string;
  sectorId?: string;
  projectId?: string;
}

export interface UsuarioEscala {
  id: string;
  nome: string;
  username?: string;
  email: string;
  avatarUrl?: string;
  cargo?: string;
  departamento?: string;
  role: string;
  telefone?: string;
  remoto?: boolean;
  tipoVinculo?: string;
  empresaId?: string;
  setorId?: string;
  projetoId?: string;
}
