import { OperationalCapacityBackendAdapter, OperationalCapacityModel } from "@/infrastructure/adapters/operationalCapacity.adapter";

export class OperationalCapacityService {
  static async listCapacities(token?: string): Promise<OperationalCapacityModel[]> {
    return await OperationalCapacityBackendAdapter.listCapacities(token);
  }

  static async createCapacity(capacity: OperationalCapacityModel, token?: string): Promise<OperationalCapacityModel> {
    return await OperationalCapacityBackendAdapter.createCapacity(capacity, token);
  }

  static async deleteCapacity(id: string, token?: string): Promise<void> {
    return await OperationalCapacityBackendAdapter.deleteCapacity(id, token);
  }
}
