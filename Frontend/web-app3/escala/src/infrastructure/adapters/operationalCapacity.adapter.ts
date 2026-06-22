import { ENV } from "@/constants/env";

export interface OperationalCapacityModel {
  id?: string;
  targetId: string;
  targetType: 'SECTOR' | 'WORK_POST';
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  minEmployeesRequired: number;
}

export class OperationalCapacityBackendAdapter {
  private static baseUrl = ENV.API_BASE_URL;

  static async listCapacities(token: string): Promise<OperationalCapacityModel[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/operational-capacities`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) throw new Error("Failed to fetch capacities");
    return await response.json();
  }

  static async createCapacity(capacity: OperationalCapacityModel, token: string): Promise<OperationalCapacityModel> {
    const response = await fetch(`${this.baseUrl}/api/v1/operational-capacities`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetId: parseInt(capacity.targetId),
        targetType: capacity.targetType,
        dayOfWeek: capacity.dayOfWeek,
        startTime: capacity.startTime,
        endTime: capacity.endTime,
        minEmployeesRequired: capacity.minEmployeesRequired,
      }),
    });
    if (!response.ok) throw new Error("Failed to create capacity");
    return await response.json();
  }

  static async deleteCapacity(id: string, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/operational-capacities/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to delete capacity");
  }
}
