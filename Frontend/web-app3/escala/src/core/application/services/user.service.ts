import { UserProfile } from "@/core/domain/models/user.model";
import { UserBackendAdapter } from "@/infrastructure/adapters/user.adapter";

export class UserService {
  static async getCurrentProfile(token: string): Promise<UserProfile> {
    // Aqui poderiam entrar regras de negócio, cache, ou orquestração entre múltiplos adaptadores
    return await UserBackendAdapter.getMe(token);
  }

  static async listUsers(token: string): Promise<UserProfile[]> {
    return await UserBackendAdapter.listUsers(token);
  }

  static async updateProfile(token: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    // Regra de Negócio Exemplo: Validar campos específicos ou disparar eventos de auditoria
    return await UserBackendAdapter.updateMe(token, profile);
  }
}
