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
    const dto: any = {
      username: domain.username,
      email: domain.email,
      theme: domain.theme,
      avatarUrl: domain.avatarUrl,
      position: domain.position,
      function: domain.function,
    };

    if (domain.address) {
      dto.cep = domain.address.cep;
      dto.street = domain.address.street;
      dto.number = domain.address.number;
      dto.complement = domain.address.complement;
      dto.neighborhood = domain.address.neighborhood;
      dto.city = domain.address.city;
      dto.state = domain.address.state;
      dto.address = domain.address.additionalInfo;
    }

    // Remove undefined/null fields to avoid sending them to the backend
    return Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined && v !== null)
    );
  }
}
