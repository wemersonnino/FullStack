import {
  ManagementClosure,
  ManagementEdge,
  ManagementEdgePayload,
  ManagerAssignment,
  ManagerAssignmentPayload,
  ManagerRoleLevelOption,
  ManagerScopeTypeOption,
} from '@/core/domain/models/rebac.model';

export class RebacBackendAdapter {
  private static baseUrl = '/api/bff/rebac';

  private static url(path: string) {
    const url = `${this.baseUrl}${path}`;
    if (typeof window !== 'undefined') return url;
    return new URL(url, process.env.NEXTAUTH_URL || 'http://localhost:3000').toString();
  }

  private static headers(token: string, json = false): HeadersInit {
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(json ? { 'Content-Type': 'application/json' } : {}),
    };
  }

  private static async parse<T>(response: Response, fallback: string): Promise<T> {
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const message = body?.message || body?.error || fallback;
      throw new Error(message);
    }
    return response.json();
  }

  static async listAssignments(token: string): Promise<ManagerAssignment[]> {
    const response = await fetch(this.url('/manager-assignments'), {
      headers: this.headers(token),
      cache: 'no-store',
    });
    return this.parse(response, 'Falha ao listar manager assignments');
  }

  static async createAssignment(token: string, payload: ManagerAssignmentPayload): Promise<ManagerAssignment> {
    const response = await fetch(this.url('/manager-assignments'), {
      method: 'POST',
      headers: this.headers(token, true),
      body: JSON.stringify(payload),
    });
    return this.parse(response, 'Falha ao criar manager assignment');
  }

  static async deleteAssignment(token: string, id: string): Promise<void> {
    const response = await fetch(this.url(`/manager-assignments/${id}`), {
      method: 'DELETE',
      headers: this.headers(token),
    });
    await this.parse(response, 'Falha ao remover manager assignment');
  }

  static async listEdges(token: string): Promise<ManagementEdge[]> {
    const response = await fetch(this.url('/management-edges'), {
      headers: this.headers(token),
      cache: 'no-store',
    });
    return this.parse(response, 'Falha ao listar management edges');
  }

  static async createEdge(token: string, payload: ManagementEdgePayload): Promise<ManagementEdge> {
    const response = await fetch(this.url('/management-edges'), {
      method: 'POST',
      headers: this.headers(token, true),
      body: JSON.stringify(payload),
    });
    return this.parse(response, 'Falha ao criar management edge');
  }

  static async deleteEdge(token: string, id: string): Promise<void> {
    const response = await fetch(this.url(`/management-edges/${id}`), {
      method: 'DELETE',
      headers: this.headers(token),
    });
    await this.parse(response, 'Falha ao remover management edge');
  }

  static async listClosure(token: string): Promise<ManagementClosure[]> {
    const response = await fetch(this.url('/management-closure'), {
      headers: this.headers(token),
      cache: 'no-store',
    });
    return this.parse(response, 'Falha ao listar management closure');
  }

  static async recalculateClosure(token: string): Promise<ManagementClosure[]> {
    const response = await fetch(this.url('/management-closure/recalculate'), {
      method: 'POST',
      headers: this.headers(token),
    });
    return this.parse(response, 'Falha ao recalcular management closure');
  }

  static async listScopeTypes(token: string): Promise<ManagerScopeTypeOption[]> {
    const response = await fetch(this.url('/enums/manager-scope-types'), {
      headers: this.headers(token),
      cache: 'no-store',
    });
    return this.parse(response, 'Falha ao listar ManagerScopeType');
  }

  static async listRoleLevels(token: string): Promise<ManagerRoleLevelOption[]> {
    const response = await fetch(this.url('/enums/manager-role-levels'), {
      headers: this.headers(token),
      cache: 'no-store',
    });
    return this.parse(response, 'Falha ao listar ManagerRoleLevel');
  }
}
