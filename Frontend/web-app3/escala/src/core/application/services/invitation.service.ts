import { TeamInvitation, TeamInvitationCreate } from "@/core/domain/models/invitation.model";
import { InvitationBackendAdapter } from "@/infrastructure/adapters/invitation.adapter";

export class InvitationService {
  static async sendInvitation(invitation: TeamInvitationCreate, token: string): Promise<TeamInvitation> {
    return await InvitationBackendAdapter.invite(invitation, token);
  }

  static async listInvitations(token: string): Promise<TeamInvitation[]> {
    return await InvitationBackendAdapter.list(token);
  }

  static async cancelInvitation(id: string, token: string): Promise<void> {
    return await InvitationBackendAdapter.cancel(id, token);
  }

  static async getInvitationByToken(token: string): Promise<TeamInvitation> {
    return await InvitationBackendAdapter.findByToken(token);
  }
}
