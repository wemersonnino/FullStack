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
  id: string;
  managerUserId: string;
  managerName: string;
  managerEmail: string;
  scopeType: ManagerScopeType;
  scopeId: string;
  roleLevel: ManagerRoleLevel;
  levelWeight: number;
  startsAt?: string | null;
  endsAt?: string | null;
  active: boolean;
};

export type ManagementEdge = {
  id: string;
  parentUserId: string;
  parentName: string;
  parentEmail: string;
  childUserId: string;
  childName: string;
  childEmail: string;
  relationType: string;
  startsAt?: string | null;
  endsAt?: string | null;
  active: boolean;
};

export type ManagementClosure = {
  id: string;
  ancestorUserId: string;
  ancestorName: string;
  ancestorEmail: string;
  descendantUserId: string;
  descendantName: string;
  descendantEmail: string;
  depth: number;
  maxWeightPath: number;
};

export type ManagerAssignmentPayload = {
  managerUserId: string;
  scopeType: ManagerScopeType;
  scopeId: string;
  roleLevel?: ManagerRoleLevel;
  startsAt?: string;
  endsAt?: string;
  active?: boolean;
};

export type ManagementEdgePayload = {
  parentUserId: string;
  childUserId: string;
  relationType?: string;
  startsAt?: string;
  endsAt?: string;
  active?: boolean;
};

export function canAdministerRebac(roles: string[]) {
  return roles.includes('OWNER') || roles.includes('ADMIN');
}
