import { ENV } from "@/constants/env";
import { UserMapper } from "./mappers/user.mapper";
import { UserProfile } from "@/core/domain/models/user.model";

export class UserBackendAdapter {
  private static baseUrl = '/api/bff/users';
  private static backendBaseUrl = `${ENV.API_BASE_URL}/api/v1/users`;

  private static url(path: string, token?: string) {
    if (typeof window === 'undefined' && token) {
      return `${this.backendBaseUrl}${path}`;
    }

    const url = `${this.baseUrl}${path}`;
    if (typeof window !== 'undefined') return url;
    return new URL(url, process.env.NEXTAUTH_URL || 'http://localhost:3000').toString();
  }

  private static extractCollection<T>(payload: T[] | { content?: T[] } | null | undefined): T[] {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
  }

  static async getMe(token: string): Promise<UserProfile> {
    const response = await fetch(this.url('/me', token), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error("Failed to fetch profile from backend");
    const dto = await response.json();
    return UserMapper.toDomain(dto);
  }

  static async listUsers(token: string): Promise<UserProfile[]> {
    const response = await fetch(this.url('', token), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error("Failed to fetch users from backend");
    const dtos = this.extractCollection(await response.json());
    return dtos.map((dto: unknown) => UserMapper.toDomain(dto));
  }

  static async updateMe(token: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    const dto = UserMapper.toUpdateDto(profile);
    
    const response = await fetch(this.url('/me', token), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) throw new Error("Failed to update profile in backend");
    const updatedDto = await response.json();
    return UserMapper.toDomain(updatedDto);
  }
}
