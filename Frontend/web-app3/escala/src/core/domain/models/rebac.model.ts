export type ManagerScopeType =
  | 'COMPANY'
  | 'SECTOR'
  | 'PROJECT'
  | 'WORK_POST'
  | 'TEAM'
  | 'EMPLOYEE';

export type ManagerRoleLevel =
  | 'OWNER'
  | 'ADMIN'
  | 'MANAGER_DIRETOR'
  | 'MANAGER_GERENTE'
  | 'MANAGER_COORDENADOR'
  | 'MANAGER_SUPERVISOR';

export type ManagerRoleLevelOption = {
  name: ManagerRoleLevel;
  weight: number;
};

export type ManagerScopeTypeOption = {
  name: ManagerScopeType;
};

export type ManagerAssignment = {
  id: number;
  managerUserId: number;
  managerName: string;
  managerEmail: string;
  scopeType: ManagerScopeType;
  scopeId: number;
  roleLevel: ManagerRoleLevel;
  levelWeight: number;
  startsAt?: string | null;
  endsAt?: string | null;
  active: boolean;
};

export type ManagementEdge = {
  id: number;
  parentUserId: number;
  parentName: string;
  parentEmail: string;
  childUserId: number;
  childName: string;
  childEmail: string;
  relationType: string;
  startsAt?: string | null;
  endsAt?: string | null;
  active: boolean;
};

export type ManagementClosure = {
  id: number;
  ancestorUserId: number;
  ancestorName: string;
  ancestorEmail: string;
  descendantUserId: number;
  descendantName: string;
  descendantEmail: string;
  depth: number;
  maxWeightPath: number;
};

export type ManagerAssignmentPayload = {
  managerUserId: number;
  scopeType: ManagerScopeType;
  scopeId: number;
  roleLevel?: ManagerRoleLevel;
  startsAt?: string;
  endsAt?: string;
  active?: boolean;
};

export type ManagementEdgePayload = {
  parentUserId: number;
  childUserId: number;
  relationType?: string;
  startsAt?: string;
  endsAt?: string;
  active?: boolean;
};

export function canAdministerRebac(roles: string[]) {
  return roles.includes('OWNER') || roles.includes('ADMIN');
}
