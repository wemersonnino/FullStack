import { Company } from "@/core/domain/models/company.model";
import { CompanyBackendAdapter } from "@/infrastructure/adapters/company.adapter";

export class CompanyService {
  static async listCompanies(token: string): Promise<Company[]> {
    return await CompanyBackendAdapter.list(token);
  }

  static async getCompany(id: string, token: string): Promise<Company> {
    return await CompanyBackendAdapter.findById(id, token);
  }

  static async createCompany(company: Partial<Company>, token: string): Promise<Company> {
    return await CompanyBackendAdapter.create(company, token);
  }

  static async updateCompany(id: string, company: Partial<Company>, token: string): Promise<Company> {
    return await CompanyBackendAdapter.update(id, company, token);
  }

  static async deleteCompany(id: string, token: string): Promise<void> {
    return await CompanyBackendAdapter.delete(id, token);
  }
}
