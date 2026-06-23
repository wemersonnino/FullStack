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
  private static baseUrl = '/api/bff/operational-capacities';

  static async listCapacities(_token: string): Promise<OperationalCapacityModel[]> {
    const response = await fetch(this.baseUrl, {
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) throw new Error("Failed to fetch capacities");
    return await response.json();
  }

  static async createCapacity(capacity: OperationalCapacityModel, _token: string): Promise<OperationalCapacityModel> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
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

  static async deleteCapacity(id: string, _token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error("Failed to delete capacity");
  }
}
