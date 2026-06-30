import {
  ManagementEdgePayload,
  ManagerAssignmentPayload,
  canAdministerRebac,
} from '@/core/domain/models/rebac.model';
import { RebacBackendAdapter } from '@/infrastructure/adapters/rebac.adapter';

export class RebacService {
  static canAdminister(roles: string[]) {
    return canAdministerRebac(roles);
  }

  static listAssignments(token?: string) {
    return RebacBackendAdapter.listAssignments(token);
  }

  static createAssignment(token: string | undefined, payload: ManagerAssignmentPayload) {
    return RebacBackendAdapter.createAssignment(token, payload);
  }

  static deleteAssignment(token: string | undefined, id: string) {
    return RebacBackendAdapter.deleteAssignment(token, id);
  }

  static listEdges(token?: string) {
    return RebacBackendAdapter.listEdges(token);
  }

  static createEdge(token: string | undefined, payload: ManagementEdgePayload) {
    return RebacBackendAdapter.createEdge(token, payload);
  }

  static deleteEdge(token: string | undefined, id: string) {
    return RebacBackendAdapter.deleteEdge(token, id);
  }

  static listClosure(token?: string) {
    return RebacBackendAdapter.listClosure(token);
  }

  static recalculateClosure(token?: string) {
    return RebacBackendAdapter.recalculateClosure(token);
  }

  static listScopeTypes(token?: string) {
    return RebacBackendAdapter.listScopeTypes(token);
  }

  static listRoleLevels(token?: string) {
    return RebacBackendAdapter.listRoleLevels(token);
  }
}
