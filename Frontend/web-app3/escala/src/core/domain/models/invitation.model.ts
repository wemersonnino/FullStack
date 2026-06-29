export interface TeamInvitation {
  id: string;
  email: string;
  roleName: string;
  companyName: string;
  companySlug: string;
  inviteUrl?: string;
  expiresAt: string;
  acceptedAt?: string;
  active: boolean;
  expired: boolean;
}

export interface TeamInvitationCreate {
  email: string;
  roleName: string;
}
