import { ENV } from "@/constants/env";
import { PayrollItem } from "@/core/domain/models/payroll.model";

export class ReportBackendAdapter {
  private static baseUrl = ENV.API_INTERNAL_URL;

  static async getPayroll(token: string, month: string): Promise<PayrollItem[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/reports/payroll?month=${month}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch payroll report");
    return await response.json();
  }

  static async exportPayroll(token: string, month: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/v1/reports/payroll/export?month=${month}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export payroll");
    return await response.blob();
  }
}
