import { Company } from "@/core/domain/models/company.model";

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function readAddress(source: any) {
  const address = isRecord(source?.address) ? source.address : {};
  return {
    cep: source?.cep ?? address.cep,
    street: source?.street ?? address.street,
    number: source?.number ?? address.number,
    complement: source?.complement ?? address.complement,
    neighborhood: source?.neighborhood ?? address.neighborhood,
    city: source?.city ?? address.city,
    state: source?.state ?? address.state,
    additionalInfo: source?.address?.additionalInfo ?? source?.address ?? address.additionalInfo,
  };
}

export class CompanyMapper {
  static toDomain(dto: any): Company {
    const address = readAddress(dto);
    return {
      id: dto.id?.toString() || "",
      name: dto.name || "",
      slug: dto.slug || "",
      cnpj: dto.cnpj,
      logoUrl: dto.logoUrl ?? dto.logo?.url,
      active: !!dto.active,
      address,
    };
  }

  static toDto(domain: Partial<Company>) {
    const address = isRecord(domain.address) ? domain.address : {};
    const additionalInfo = typeof domain.address === 'string' ? domain.address : address.additionalInfo;
    const flat = domain as any;
    return {
      name: domain.name,
      cnpj: domain.cnpj,
      logoUrl: domain.logoUrl ?? flat.logo?.url,
      active: domain.active,
      cep: flat.cep ?? address.cep,
      street: flat.street ?? address.street,
      number: flat.number ?? address.number,
      complement: flat.complement ?? address.complement,
      neighborhood: flat.neighborhood ?? address.neighborhood,
      city: flat.city ?? address.city,
      state: flat.state ?? address.state,
      address: domain.address && typeof domain.address !== 'string' ? domain.address.additionalInfo : additionalInfo,
    };
  }
}
