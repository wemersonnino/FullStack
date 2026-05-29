import { Company } from "@/core/domain/models/company.model";

export class CompanyMapper {
  static toDomain(dto: any): Company {
    return {
      id: dto.id?.toString() || "",
      name: dto.name || "",
      slug: dto.slug || "",
      cnpj: dto.cnpj,
      logoUrl: dto.logoUrl,
      active: !!dto.active,
      address: {
        cep: dto.cep,
        street: dto.street,
        number: dto.number,
        complement: dto.complement,
        neighborhood: dto.neighborhood,
        city: dto.city,
        state: dto.state,
        additionalInfo: dto.address,
      },
    };
  }

  static toDto(domain: Partial<Company>) {
    return {
      name: domain.name,
      cnpj: domain.cnpj,
      logoUrl: domain.logoUrl,
      active: domain.active,
      cep: domain.address?.cep,
      street: domain.address?.street,
      number: domain.address?.number,
      complement: domain.address?.complement,
      neighborhood: domain.address?.neighborhood,
      city: domain.address?.city,
      state: domain.address?.state,
      address: domain.address?.additionalInfo,
    };
  }
}
