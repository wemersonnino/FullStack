import { TeamInvitation } from "@/core/domain/models/invitation.model";

export class InvitationMapper {
  static toDomain(dto: any): TeamInvitation {
    return {
      id: dto.id?.toString() || "",
      email: dto.email || "",
      token: dto.token || "",
      roleName: dto.roleName || "",
      companyName: dto.companyName || "",
      expiresAt: dto.expiresAt || "",
      acceptedAt: dto.acceptedAt,
      active: !!dto.active,
      expired: !!dto.expired,
    };
  }
}
