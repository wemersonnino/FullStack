import { WorkPostBackendAdapter, WorkPostModel } from "@/infrastructure/adapters/workPost.adapter";

export class WorkPostService {
  static async list(token?: string): Promise<WorkPostModel[]> {
    return await WorkPostBackendAdapter.list(token);
  }

  static async create(workPost: WorkPostModel, token?: string): Promise<WorkPostModel> {
    return await WorkPostBackendAdapter.create(workPost, token);
  }

  static async delete(id: string, token?: string): Promise<void> {
    return await WorkPostBackendAdapter.delete(id, token);
  }
}
