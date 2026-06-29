import { TeamInvitation } from "@/core/domain/models/invitation.model";

export class InvitationMapper {
  static toDomain(dto: any): TeamInvitation {
    return {
      id: dto.id?.toString() || "",
      email: dto.email || "",
      roleName: dto.roleName || "",
      companyName: dto.companyName || "",
      companySlug: dto.companySlug || "",
      inviteUrl: dto.inviteUrl || undefined,
      expiresAt: dto.expiresAt || "",
      acceptedAt: dto.acceptedAt,
      active: !!dto.active,
      expired: !!dto.expired,
    };
  }
}
