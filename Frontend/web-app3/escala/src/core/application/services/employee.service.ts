import { Employee } from "@/core/domain/models/employee.model";
import { EmployeeBackendAdapter } from "@/infrastructure/adapters/employee.adapter";

export class EmployeeService {
  static async listEmployees(token: string): Promise<Employee[]> {
    return await EmployeeBackendAdapter.list(token);
  }

  static async getEmployee(id: string, token: string): Promise<Employee> {
    return await EmployeeBackendAdapter.findById(id, token);
  }

  static async createEmployee(employee: Partial<Employee>, token: string): Promise<Employee> {
    return await EmployeeBackendAdapter.create(employee, token);
  }

  static async updateEmployee(id: string, employee: Partial<Employee>, token: string): Promise<Employee> {
    return await EmployeeBackendAdapter.update(id, employee, token);
  }

  static async deleteEmployee(id: string, token: string): Promise<void> {
    return await EmployeeBackendAdapter.delete(id, token);
  }
}
