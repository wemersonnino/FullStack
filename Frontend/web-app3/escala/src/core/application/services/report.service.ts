import { ReportBackendAdapter } from "@/infrastructure/adapters/report.adapter";
import { PayrollItem } from "@/core/domain/models/payroll.model";

export class ReportService {
  static async getPayrollData(token: string, month: string): Promise<PayrollItem[]> {
    return await ReportBackendAdapter.getPayroll(token, month);
  }

  static async downloadPayrollCsv(token: string, month: string): Promise<void> {
    const blob = await ReportBackendAdapter.exportPayroll(token, month);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `folha_${month}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
