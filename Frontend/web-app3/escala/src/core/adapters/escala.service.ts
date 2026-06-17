import {
  adaptAtualizarEscalaPayloadToDto,
  adaptCriarEscalaPayloadToDto,
  adaptEscalaDtoToEscala,
  adaptUsuarioEscalaDtoToUsuarioEscala,
} from '@/core/adapters/escala.adapter';
import {
  AtualizarEscalaPayload,
  CriarEscalaPayload,
  Escala,
  EscalaFilters,
  UsuarioEscala,
} from '@/core/domain/escala/escala.types';
import { httpDelete, httpGet, httpPost, httpPut } from '@/lib/http/request';

const BASE = '/api/server/api/v1/escala';

type ServiceOptions = {
  authToken?: string;
};

type UsuariosEscalaFilters = {
  projetoId?: string;
  setorId?: string;
  empresaId?: string;
  q?: string;
};

function compactParams(params?: Record<string, unknown>) {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, String(value)])
  );
}

export async function getMinhasEscalas(params?: EscalaFilters, options?: ServiceOptions): Promise<Escala[]> {
  const json = await httpGet<unknown[]>(`${BASE}/me`, compactParams(params), options);
  return Array.isArray(json) ? json.map((item) => adaptEscalaDtoToEscala(item as Record<string, any>)) : [];
}

export async function getEscalas(params?: EscalaFilters, options?: ServiceOptions): Promise<Escala[]> {
  const json = await httpGet<unknown[]>(BASE, compactParams(params), options);
  return Array.isArray(json) ? json.map((item) => adaptEscalaDtoToEscala(item as Record<string, any>)) : [];
}

export async function getEscalasDoDia(data: string, options?: ServiceOptions): Promise<Escala[]> {
  const json = await httpGet<unknown[]>(`${BASE}/dia`, { data }, options);
  return Array.isArray(json) ? json.map((item) => adaptEscalaDtoToEscala(item as Record<string, any>)) : [];
}

export async function criarEscala(payload: CriarEscalaPayload, options?: ServiceOptions): Promise<Escala[]> {
  const json = await httpPost<unknown[]>(BASE, adaptCriarEscalaPayloadToDto(payload), { ...options, throwOnError: true });
  return Array.isArray(json) ? json.map((item) => adaptEscalaDtoToEscala(item as Record<string, any>)) : [];
}

export async function atualizarEscala(payload: AtualizarEscalaPayload, options?: ServiceOptions): Promise<Escala | null> {
  const json = await httpPut<unknown>(`${BASE}/${payload.id}`, adaptAtualizarEscalaPayloadToDto(payload), { ...options, throwOnError: true });
  return json ? adaptEscalaDtoToEscala(json as Record<string, any>) : null;
}

export async function removerEscala(id: string, options?: ServiceOptions): Promise<boolean> {
  const json = await httpDelete<{ deleted?: boolean }>(`${BASE}/${id}`, { ...options, throwOnError: true });
  return Boolean(json?.deleted ?? true);
}

export async function getUsuariosEscala(filters?: UsuariosEscalaFilters, options?: ServiceOptions): Promise<UsuarioEscala[]> {
  const json = await httpGet<unknown[]>(`${BASE}/usuarios`, compactParams(filters), options);
  return Array.isArray(json) ? json.map((item) => adaptUsuarioEscalaDtoToUsuarioEscala(item as Record<string, any>)) : [];
}

export async function getUsuarioEscala(id: string, options?: ServiceOptions): Promise<UsuarioEscala | null> {
  const json = await httpGet<unknown>(`${BASE}/usuarios/${id}`, undefined, options);
  return json ? adaptUsuarioEscalaDtoToUsuarioEscala(json as Record<string, any>) : null;
}
