import { UserMapper } from "./mappers/user.mapper";
import { UserProfile } from "@/core/domain/models/user.model";

export class UserBackendAdapter {
  private static baseUrl = '/api/bff/users';

  private static url(path: string) {
    const url = `${this.baseUrl}${path}`;
    if (typeof window !== 'undefined') return url;
    return new URL(url, process.env.NEXTAUTH_URL || 'http://localhost:3000').toString();
  }

  static async getMe(token: string): Promise<UserProfile> {
    const response = await fetch(this.url('/me'), {
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
    const response = await fetch(this.url(''), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error("Failed to fetch users from backend");
    const dtos = await response.json();
    return dtos.map((dto: unknown) => UserMapper.toDomain(dto));
  }

  static async updateMe(token: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    const dto = UserMapper.toUpdateDto(profile);
    
    const response = await fetch(this.url('/me'), {
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
