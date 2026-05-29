package com.escala.authservice.service;

import com.escala.authservice.dto.PayrollReportItem;
import com.escala.authservice.entity.Employee;
import com.escala.authservice.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final EmployeeRepository employeeRepository;

    public List<PayrollReportItem> generatePayrollReport(Long companyId, String month) {
        List<Employee> employees = employeeRepository.findByCompanyId(companyId);

        return employees.stream().map(emp -> PayrollReportItem.builder()
                .employeeName(emp.getFullName())
                .employeeEmail(emp.getEmail())
                .totalHours(160L) // Mock values for MVP
                .extraHours(10L)
                .nightHours(5L)
                .absences(0L)
                .estimatedCost(new BigDecimal("3500.00"))
                .period(month)
                .build())
                .collect(Collectors.toList());
    }

    public String exportToCsv(List<PayrollReportItem> report) {
        StringBuilder csv = new StringBuilder();
        csv.append("Colaborador;Email;Total Horas;Horas Extras;Adic. Noturno;Faltas;Custo Estimado\n");
        
        for (PayrollReportItem item : report) {
            csv.append(String.format("%s;%s;%d;%d;%d;%d;%s\n",
                    item.getEmployeeName(),
                    item.getEmployeeEmail(),
                    item.getTotalHours(),
                    item.getExtraHours(),
                    item.getNightHours(),
                    item.getAbsences(),
                    item.getEstimatedCost().toString()));
        }
        
        return csv.toString();
    }
}
