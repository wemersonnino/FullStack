import { UserProfile } from "@/core/domain/models/user.model";
import { ThemeEnum } from "@/interfaces/enums/theme.enum";

export class UserMapper {
  static toDomain(dto: any): UserProfile {
    return {
      id: dto.id?.toString() || "",
      username: dto.username || "",
      email: dto.email || "",
      roles: dto.roles || [],
      theme: (dto.theme as ThemeEnum) || ThemeEnum.SYSTEM,
      avatarUrl: dto.avatarUrl,
      position: dto.position,
      function: dto.function,
      address: {
        cep: dto.cep,
        street: dto.street,
        number: dto.number,
        complement: dto.complement,
        neighborhood: dto.neighborhood,
        city: dto.city,
        state: dto.state,
        additionalInfo: dto.address, // Mapping 'address' field from DTO to 'additionalInfo'
      },
      company: dto.companyId ? {
        id: dto.companyId?.toString(),
        slug: dto.companySlug,
        name: dto.companyName,
        theme: dto.companyTheme
      } : undefined
    };
  }

  static toUpdateDto(domain: Partial<UserProfile>) {
    return {
      username: domain.username,
      email: domain.email,
      theme: domain.theme,
      avatarUrl: domain.avatarUrl,
      position: domain.position,
      function: domain.function,
      cep: domain.address?.cep,
      street: domain.address?.street,
      number: domain.address?.number,
      complement: domain.address?.complement,
      neighborhood: domain.address?.neighborhood,
      city: domain.address?.city,
      state: domain.address?.state,
      address: domain.address?.additionalInfo, // Mapping back to 'address' for the backend
    };
  }
}
