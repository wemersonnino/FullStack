import { ENV } from "@/constants/env";

export interface WorkPostModel {
  id?: string;
  name: string;
  description?: string;
  projectId?: string;
}

export class WorkPostBackendAdapter {
  private static baseUrl = ENV.API_BASE_URL;

  static async list(token: string): Promise<WorkPostModel[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/work-posts`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) throw new Error("Failed to fetch work posts");
    const data = await response.json();
    return data.map((item: any) => ({
      id: item.id?.toString(),
      name: item.name,
      description: item.description,
      projectId: item.project?.id?.toString(),
    }));
  }

  static async create(workPost: WorkPostModel, token: string): Promise<WorkPostModel> {
    const response = await fetch(`${this.baseUrl}/api/v1/work-posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: workPost.name,
        description: workPost.description,
        project: workPost.projectId ? { id: parseInt(workPost.projectId) } : null,
      }),
    });
    if (!response.ok) throw new Error("Failed to create work post");
    const item = await response.json();
    return {
      id: item.id?.toString(),
      name: item.name,
      description: item.description,
      projectId: item.project?.id?.toString(),
    };
  }

  static async delete(id: string, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/work-posts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to delete work post");
  }
}
