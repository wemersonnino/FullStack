import { ENV } from "@/constants/env";
import { EmployeeMapper } from "./mappers/employee.mapper";
import { Employee } from "@/core/domain/models/employee.model";

export class EmployeeBackendAdapter {
  private static baseUrl = ENV.API_INTERNAL_URL;

  static async list(token: string): Promise<Employee[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/employees`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) throw new Error("Failed to fetch employees");
    const dtos = await response.json();
    return dtos.map((dto: any) => EmployeeMapper.toDomain(dto));
  }

  static async findById(id: string, token: string): Promise<Employee> {
    const response = await fetch(`${this.baseUrl}/api/v1/employees/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) throw new Error("Failed to fetch employee");
    const dto = await response.json();
    return EmployeeMapper.toDomain(dto);
  }

  static async create(employee: Partial<Employee>, token: string): Promise<Employee> {
    const dto = EmployeeMapper.toDto(employee);
    const response = await fetch(`${this.baseUrl}/api/v1/employees`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) throw new Error("Failed to create employee");
    const resultDto = await response.json();
    return EmployeeMapper.toDomain(resultDto);
  }

  static async update(id: string, employee: Partial<Employee>, token: string): Promise<Employee> {
    const dto = EmployeeMapper.toDto(employee);
    const response = await fetch(`${this.baseUrl}/api/v1/employees/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) throw new Error("Failed to update employee");
    const resultDto = await response.json();
    return EmployeeMapper.toDomain(resultDto);
  }

  static async delete(id: string, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/employees/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to delete employee");
  }
}
