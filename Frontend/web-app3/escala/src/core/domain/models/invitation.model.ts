export interface TeamInvitation {
  id: string;
  email: string;
  token: string;
  roleName: string;
  companyName: string;
  expiresAt: string;
  acceptedAt?: string;
  active: boolean;
  expired: boolean;
}

export interface TeamInvitationCreate {
  email: string;
  roleName: string;
}
