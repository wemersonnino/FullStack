import { PayrollItem } from "@/core/domain/models/payroll.model";

export class ReportBackendAdapter {
  private static baseUrl = '/api/bff/reports/payroll';

  private static url(path = '') {
    const url = `${this.baseUrl}${path}`;
    if (typeof window !== 'undefined') return url;
    return new URL(url, process.env.NEXTAUTH_URL || 'http://localhost:3000').toString();
  }

  static async getPayroll(token: string, month: string): Promise<PayrollItem[]> {
    const response = await fetch(this.url(`?month=${month}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch payroll report");
    return await response.json();
  }

  static async exportPayroll(token: string, month: string): Promise<Blob> {
    const response = await fetch(this.url(`/export?month=${month}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export payroll");
    return await response.blob();
  }
}
