export interface PayrollItem {
  employeeName: string;
  employeeEmail: string;
  totalHours: number;
  extraHours: number;
  nightHours: number;
  absences: number;
  estimatedCost: number;
  period: string;
}
