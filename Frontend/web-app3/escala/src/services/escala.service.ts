import { httpDelete, httpGet, httpPatch, httpPost, httpPut } from '@/lib/http/request';
import { Escala, EscalaRequest, UsuarioEscala } from '@/interfaces/escala/escala.interface';

const BASE_URL = '/api/bff/escalas';

export async function getMinhasEscalas(inicio?: string, fim?: string): Promise<Escala[]> {
  const params = new URLSearchParams();
  if (inicio) params.append('inicio', inicio);
  if (fim) params.append('fim', fim);
  return await httpGet<Escala[]>(`${BASE_URL}/me?${params.toString()}`) || [];
}

export async function getEscalas(filters: {
  inicio?: string;
  fim?: string;
  usuarioId?: number;
  setorId?: number;
  projetoId?: number;
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
  return await httpPost<Escala[]>(BASE_URL, data) || [];
}

export async function updateEscala(id: number, data: Partial<EscalaRequest>): Promise<Escala | null> {
  return await httpPut<Escala>(`${BASE_URL}/${id}`, data);
}

export async function cancelEscala(id: number): Promise<boolean> {
  const result = await httpDelete<{ deleted: boolean }>(`${BASE_URL}/${id}`);
  return !!result?.deleted;
}

export async function getUsuariosEscalaveis(filters: {
  projetoId?: number;
  setorId?: number;
  empresaId?: number;
  q?: string;
}): Promise<UsuarioEscala[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value.toString());
  });
  return await httpGet<UsuarioEscala[]>(`${BASE_URL}/usuarios?${params.toString()}`) || [];
}

export async function getUsuarioEscalavel(id: number): Promise<UsuarioEscala | null> {
  return await httpGet<UsuarioEscala>(`${BASE_URL}/usuarios/${id}`);
}
