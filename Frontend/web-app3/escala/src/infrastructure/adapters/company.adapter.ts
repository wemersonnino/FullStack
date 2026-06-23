import { CompanyMapper } from "./mappers/company.mapper";
import { Company } from "@/core/domain/models/company.model";

export class CompanyBackendAdapter {
  private static baseUrl = '/api/bff/companies';

  private static url(path = '') {
    const url = `${this.baseUrl}${path}`;
    if (typeof window !== 'undefined') return url;
    return new URL(url, process.env.NEXTAUTH_URL || 'http://localhost:3000').toString();
  }

  static async list(token: string): Promise<Company[]> {
    const response = await fetch(this.url(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) throw new Error("Failed to fetch companies");
    const dtos = await response.json();
    return dtos.map((dto: any) => CompanyMapper.toDomain(dto));
  }

  static async findById(id: string, token: string): Promise<Company> {
    const response = await fetch(this.url(`/${id}`), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) throw new Error("Failed to fetch company");
    const dto = await response.json();
    return CompanyMapper.toDomain(dto);
  }

  static async create(company: Partial<Company>, token: string): Promise<Company> {
    const dto = CompanyMapper.toDto(company);
    const response = await fetch(this.url(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) throw new Error("Failed to create company");
    const resultDto = await response.json();
    return CompanyMapper.toDomain(resultDto);
  }

  static async update(id: string, company: Partial<Company>, token: string): Promise<Company> {
    const dto = CompanyMapper.toDto(company);
    const response = await fetch(this.url(`/${id}`), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) throw new Error("Failed to update company");
    const resultDto = await response.json();
    return CompanyMapper.toDomain(resultDto);
  }

  static async delete(id: string, token: string): Promise<void> {
    const response = await fetch(this.url(`/${id}`), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to delete company");
  }
}
