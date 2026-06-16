import { ENV } from "@/constants/env";
import { UserMapper } from "./mappers/user.mapper";
import { UserProfile } from "@/core/domain/models/user.model";

export class UserBackendAdapter {
  private static baseUrl = ENV.API_BASE_URL;

  static async getMe(token: string): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/api/v1/users/me`, {
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

  static async updateMe(token: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    const dto = UserMapper.toUpdateDto(profile);
    
    const response = await fetch(`${this.baseUrl}/api/v1/users/me`, {
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
