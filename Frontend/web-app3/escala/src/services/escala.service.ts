import { httpDelete, httpGet, httpPost, httpPut } from '@/lib/http/request';
import { Escala, EscalaRequest, UsuarioEscala } from '@/interfaces/escala/escala.interface';

const BASE_URL = '/api/bff/escala';

type UsuarioEscalaDto = Partial<UsuarioEscala> & {
  fullName?: string;
  name?: string;
  username?: string;
  position?: string;
  phone?: string;
  contractType?: string;
  user?: {
    email?: string;
    username?: string;
    avatarUrl?: string;
  };
  sector?: {
    id?: string;
    name?: string;
    nome?: string;
  };
  setor?: {
    id?: string;
    name?: string;
    nome?: string;
  };
  project?: {
    id?: string;
  };
  projeto?: {
    id?: string;
  };
};

function normalizeUsuarioEscala(dto: UsuarioEscalaDto): UsuarioEscala {
  const sector = dto.sector ?? dto.setor;
  const project = dto.project ?? dto.projeto;

  return {
    id: String(dto.id ?? ''),
    nome: dto.nome ?? dto.fullName ?? dto.name ?? dto.user?.username ?? dto.username ?? 'Funcionário',
    username: dto.username ?? dto.user?.username,
    email: dto.email ?? dto.user?.email ?? '',
    avatarUrl: dto.avatarUrl ?? dto.user?.avatarUrl,
    cargo: dto.cargo ?? dto.position,
    departamento: dto.departamento ?? sector?.name ?? sector?.nome,
    role: dto.role ?? 'USER',
    telefone: dto.telefone ?? dto.phone,
    remoto: dto.remoto ?? false,
    tipoVinculo: dto.tipoVinculo ?? dto.contractType ?? 'CLT',
    empresaId: dto.empresaId,
    setorId: dto.setorId ?? sector?.id,
    projetoId: dto.projetoId ?? project?.id,
  };
}

export async function getMinhasEscalas(inicio?: string, fim?: string): Promise<Escala[]> {
  const params = new URLSearchParams();
  if (inicio) params.append('inicio', inicio);
  if (fim) params.append('fim', fim);
  return await httpGet<Escala[]>(`${BASE_URL}/me?${params.toString()}`) || [];
}

export async function getEscalas(filters: {
  inicio?: string;
  fim?: string;
  usuarioId?: string;
  setorId?: string;
  projetoId?: string;
}): Promise<Escala[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value.toString());
  });
  return await httpGet<Escala[]>(`${BASE_URL}?${params.toString()}`) || [];
}

export async function getEscalasDoDia(data: string): Promise<Escala[]> {
  return await httpGet<Escala[]>(`${BASE_URL}/dia?data=${data}`) || [];
}

export async function createEscalas(data: EscalaRequest): Promise<Escala[]> {
  const escalas = await httpPost<Escala[]>(BASE_URL, data, { throwOnError: true });
  return escalas || [];
}

export async function updateEscala(id: string, data: Partial<EscalaRequest>): Promise<Escala | null> {
  return await httpPut<Escala>(`${BASE_URL}/${id}`, data);
}

export async function cancelEscala(id: string): Promise<boolean> {
  const result = await httpDelete<{ deleted: boolean }>(`${BASE_URL}/${id}`);
  return !!result?.deleted;
}

export async function getUsuariosEscalaveis(filters: {
  projetoId?: string;
  setorId?: string;
  empresaId?: string;
  q?: string;
}): Promise<UsuarioEscala[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value.toString());
  });
  const data = await httpGet<UsuarioEscalaDto[]>(`${BASE_URL}/usuarios?${params.toString()}`);
  return Array.isArray(data) ? data.map(normalizeUsuarioEscala) : [];
}

export async function getUsuarioEscalavel(id: string): Promise<UsuarioEscala | null> {
  const data = await httpGet<UsuarioEscalaDto>(`${BASE_URL}/usuarios/${id}`);
  return data ? normalizeUsuarioEscala(data) : null;
}
