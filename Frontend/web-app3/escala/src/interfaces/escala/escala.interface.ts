export interface Escala {
  id: number;
  usuarioId: number;
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
  workMode: 'PRESENCIAL' | 'REMOTO' | 'HIBRIDO';
  observacao?: string;
}

export interface EscalaRequest {
  employeeId: number;
  dates: string[];
  startTime: string;
  endTime: string;
  workMode: 'PRESENCIAL' | 'REMOTO' | 'HIBRIDO';
  notes?: string;
  companyId?: number;
  sectorId?: number;
  projectId?: number;
}

export interface UsuarioEscala {
  id: number;
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
  empresaId?: number;
  setorId?: number;
  projetoId?: number;
}
