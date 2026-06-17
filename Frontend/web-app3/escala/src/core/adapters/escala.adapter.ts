import {
  AtualizarEscalaPayload,
  CriarEscalaPayload,
  Escala,
  UsuarioEscala,
} from '@/core/domain/escala/escala.types';

type AnyRecord = Record<string, any>;

function asString(value: unknown, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function first<T>(...values: T[]) {
  return values.find((value) => value !== undefined && value !== null);
}

export function adaptEscalaDtoToEscala(dto: AnyRecord): Escala {
  const employee = dto.employee ?? dto.usuario ?? dto.user ?? {};
  const sector = first(dto.sector, dto.setor, employee.sector, employee.setor) ?? {};
  const project = first(dto.project, dto.projeto, employee.project, employee.projeto) ?? {};
  const company = first(dto.company, dto.empresa, employee.company, employee.empresa) ?? {};
  const role = first(dto.role, employee.role, employee.user?.roles?.[0], employee.roles?.[0]);
  const dataInicio = asString(first(dto.dataInicio, dto.shiftDate, dto.date));
  const horarioInicio = first(dto.horarioInicio, dto.startTime, null);
  const horarioFim = first(dto.horarioFim, dto.endTime, null);
  const remoto = first(dto.remoto, dto.workMode === 'REMOTO', false);

  return {
    id: asString(dto.id),
    usuarioId: asString(first(dto.usuarioId, dto.employeeId, dto.userId, employee.id)),
    nomeUsuario: asString(first(dto.nomeUsuario, dto.employeeName, employee.fullName, employee.name, employee.username), 'Funcionario'),
    avatarUrl: first(dto.avatarUrl, employee.avatarUrl, null),
    cargo: first(dto.cargo, employee.cargo, employee.position, null),
    email: first(dto.email, employee.email, null),
    role: role ? asString(role) : null,
    dataInicio,
    data: dataInicio,
    dataFim: first(dto.dataFim, dto.endDate, null),
    horarioInicio,
    startTime: horarioInicio,
    horarioFim,
    endTime: horarioFim,
    setorId: first(dto.setorId, sector.id ? asString(sector.id) : null),
    setor: first(dto.setor, sector.name, sector.nome, null),
    setorNome: first(dto.setorNome, sector.name, sector.nome, null),
    projetoId: first(dto.projetoId, project.id ? asString(project.id) : null),
    projeto: first(dto.projeto, project.name, project.nome, null),
    projetoNome: first(dto.projetoNome, project.name, project.nome, null),
    empresaId: first(dto.empresaId, company.id ? asString(company.id) : null),
    empresaNome: first(dto.empresaNome, company.name, company.nome, null),
    local: first(dto.local, dto.location, project.name, sector.name, null),
    remoto,
    workMode: remoto ? 'REMOTO' : 'PRESENCIAL',
    observacao: first(dto.observacao, dto.notes, null),
    status: first(dto.status, null),
    criadoPor: first(dto.criadoPor, dto.createdBy, null),
    criadoEm: first(dto.criadoEm, dto.createdAt, null),
    atualizadoEm: first(dto.atualizadoEm, dto.updatedAt, null),
  };
}

export function adaptUsuarioEscalaDtoToUsuarioEscala(dto: AnyRecord): UsuarioEscala {
  const user = dto.user ?? {};
  const sector = dto.sector ?? dto.setor ?? {};
  const project = dto.project ?? dto.projeto ?? {};
  const company = dto.company ?? dto.empresa ?? {};
  const roles = user.roles ?? dto.roles ?? [];
  const role = Array.isArray(roles) ? roles[0]?.name ?? roles[0] : roles;

  return {
    id: asString(dto.id),
    nome: asString(first(dto.nome, dto.fullName, dto.name, user.username), 'Funcionario'),
    username: first(dto.username, user.username, null),
    email: asString(first(dto.email, user.email)),
    avatarUrl: first(dto.avatarUrl, user.avatarUrl, null),
    cargo: first(dto.cargo, dto.position, null),
    departamento: first(dto.departamento, sector.name, sector.nome, null),
    role: asString(first(dto.role, role, 'USER')),
    telefone: first(dto.telefone, dto.phone, null),
    remoto: first(dto.remoto, false),
    tipoVinculo: first(dto.tipoVinculo, dto.contractType, 'CLT'),
    empresaId: company.id ? asString(company.id) : null,
    empresaNome: first(company.name, company.nome, null),
    projetoId: project.id ? asString(project.id) : null,
    projetoNome: first(project.name, project.nome, null),
    setorId: sector.id ? asString(sector.id) : null,
    setorNome: first(sector.name, sector.nome, null),
  };
}

export function adaptCriarEscalaPayloadToDto(payload: CriarEscalaPayload) {
  return {
    employeeId: Number(payload.usuarioId),
    companyId: payload.empresaId ? Number(payload.empresaId) : undefined,
    sectorId: payload.setorId ? Number(payload.setorId) : undefined,
    projectId: payload.projetoId ? Number(payload.projetoId) : undefined,
    dates: payload.datas,
    startTime: payload.horarioInicio,
    endTime: payload.horarioFim,
    workMode: payload.remoto ? 'REMOTO' : 'PRESENCIAL',
    location: payload.local,
    sector: payload.setor,
    project: payload.projeto,
    notes: payload.observacao,
  };
}

export function adaptAtualizarEscalaPayloadToDto(payload: AtualizarEscalaPayload) {
  return {
    employeeId: payload.usuarioId ? Number(payload.usuarioId) : undefined,
    companyId: payload.empresaId ? Number(payload.empresaId) : undefined,
    sectorId: payload.setorId ? Number(payload.setorId) : undefined,
    projectId: payload.projetoId ? Number(payload.projetoId) : undefined,
    dates: payload.datas,
    startTime: payload.horarioInicio,
    endTime: payload.horarioFim,
    workMode: payload.remoto === undefined ? undefined : payload.remoto ? 'REMOTO' : 'PRESENCIAL',
    location: payload.local,
    sector: payload.setor,
    project: payload.projeto,
    notes: payload.observacao,
  };
}
