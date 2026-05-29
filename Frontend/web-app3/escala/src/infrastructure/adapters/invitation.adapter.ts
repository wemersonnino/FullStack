import { ENV } from "@/constants/env";
import { InvitationMapper } from "./mappers/invitation.mapper";
import { TeamInvitation, TeamInvitationCreate } from "@/core/domain/models/invitation.model";

export class InvitationBackendAdapter {
  private static baseUrl = ENV.API_INTERNAL_URL;

  static async invite(invitation: TeamInvitationCreate, token: string): Promise<TeamInvitation> {
    const response = await fetch(`${this.baseUrl}/api/v1/team/invitations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invitation),
    });

    if (!response.ok) throw new Error("Failed to send invitation");
    const dto = await response.json();
    return InvitationMapper.toDomain(dto);
  }

  static async list(token: string): Promise<TeamInvitation[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/team/invitations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to list invitations");
    const dtos = await response.json();
    return dtos.map((dto: any) => InvitationMapper.toDomain(dto));
  }

  static async cancel(id: string, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/team/invitations/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to cancel invitation");
  }

  static async findByToken(token: string): Promise<TeamInvitation> {
    const response = await fetch(`${this.baseUrl}/api/v1/team/invitations/token/${token}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) throw new Error("Invitation not found or expired");
    const dto = await response.json();
    return InvitationMapper.toDomain(dto);
  }
}
