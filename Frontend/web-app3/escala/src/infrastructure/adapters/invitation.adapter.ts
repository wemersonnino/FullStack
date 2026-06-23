import { InvitationMapper } from "./mappers/invitation.mapper";
import { TeamInvitation, TeamInvitationCreate } from "@/core/domain/models/invitation.model";

export class InvitationBackendAdapter {
  private static baseUrl = '/api/bff/team/invitations';

  private static url(path = '') {
    const url = `${this.baseUrl}${path}`;
    if (typeof window !== 'undefined') return url;
    return new URL(url, process.env.NEXTAUTH_URL || 'http://localhost:3000').toString();
  }

  static async invite(invitation: TeamInvitationCreate, _token: string): Promise<TeamInvitation> {
    const response = await fetch(this.url(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invitation),
    });

    if (!response.ok) throw new Error("Failed to send invitation");
    const dto = await response.json();
    return InvitationMapper.toDomain(dto);
  }

  static async list(_token: string): Promise<TeamInvitation[]> {
    const response = await fetch(this.url(), {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) throw new Error("Failed to list invitations");
    const dtos = await response.json();
    return dtos.map((dto: any) => InvitationMapper.toDomain(dto));
  }

  static async cancel(id: string, _token: string): Promise<void> {
    const response = await fetch(this.url(`/${id}`), {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error("Failed to cancel invitation");
  }

  static async findByToken(token: string): Promise<TeamInvitation> {
    const response = await fetch(this.url(`/token/${token}`), {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) throw new Error("Invitation not found or expired");
    const dto = await response.json();
    return InvitationMapper.toDomain(dto);
  }
}
