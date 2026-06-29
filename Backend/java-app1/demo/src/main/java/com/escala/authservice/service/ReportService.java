package com.escala.authservice.service;

import com.escala.authservice.dto.PayrollReportItem;
import com.escala.authservice.entity.Employee;
import com.escala.authservice.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final EmployeeRepository employeeRepository;

    public List<PayrollReportItem> generatePayrollReport(UUID companyId, String month) {
        String normalizedMonth = normalizeMonth(month);
        List<Employee> employees = employeeRepository.findByCompanyId(companyId);

        return employees.stream().map(emp -> PayrollReportItem.builder()
                .employeeName(emp.getFullName())
                .employeeEmail(emp.getEmail())
                .totalHours(160L) // Mock values for MVP
                .extraHours(10L)
                .nightHours(5L)
                .absences(0L)
                .estimatedCost(new BigDecimal("3500.00"))
                .period(normalizedMonth)
                .build())
                .collect(Collectors.toList());
    }

    public String normalizeMonth(String month) {
        try {
            return YearMonth.parse(month).toString();
        } catch (DateTimeParseException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parametro month invalido. Use yyyy-MM.", exception);
        }
    }

    public String exportToCsv(List<PayrollReportItem> report) {
        StringBuilder csv = new StringBuilder();
        csv.append("Colaborador;Email;Total Horas;Horas Extras;Adic. Noturno;Faltas;Custo Estimado\n");
        
        for (PayrollReportItem item : report) {
            csv.append(String.format("%s;%s;%d;%d;%d;%d;%s\n",
                    escapeCsvCell(item.getEmployeeName()),
                    escapeCsvCell(item.getEmployeeEmail()),
                    item.getTotalHours(),
                    item.getExtraHours(),
                    item.getNightHours(),
                    item.getAbsences(),
                    item.getEstimatedCost().toString()));
        }
        
        return csv.toString();
    }

    private String escapeCsvCell(String value) {
        if (value == null) {
            return "";
        }

        String sanitized = value
                .replace('\r', ' ')
                .replace('\n', ' ');

        if (!sanitized.isEmpty() && "=+-@".indexOf(sanitized.charAt(0)) >= 0) {
            sanitized = "'" + sanitized;
        }

        if (sanitized.indexOf(';') >= 0 || sanitized.indexOf('"') >= 0) {
            sanitized = "\"" + sanitized.replace("\"", "\"\"") + "\"";
        }

        return sanitized;
    }
}
