package com.escala.authservice.service;

import com.escala.authservice.dto.PayrollReportItem;
import com.escala.authservice.entity.Employee;
import com.escala.authservice.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private ReportService reportService;

    @Test
    void generatePayrollReportRejectsInvalidMonth() {
        assertThrows(ResponseStatusException.class, () -> reportService.generatePayrollReport(UUID.randomUUID(), "../../etc/passwd"));
    }

    @Test
    void generatePayrollReportNormalizesMonthAndReturnsEmployees() {
        UUID companyId = UUID.randomUUID();
        when(employeeRepository.findByCompanyId(companyId)).thenReturn(List.of(
                Employee.builder()
                        .fullName("Funcionario Teste")
                        .email("teste@example.com")
                        .build()
        ));

        List<PayrollReportItem> report = reportService.generatePayrollReport(companyId, "2026-06");

        assertEquals(1, report.size());
        assertEquals("2026-06", report.getFirst().getPeriod());
        assertEquals("Funcionario Teste", report.getFirst().getEmployeeName());
    }

    @Test
    void exportToCsvNeutralizesFormulaInjection() {
        String csv = reportService.exportToCsv(List.of(
                PayrollReportItem.builder()
                        .employeeName("=2+3")
                        .employeeEmail("formula@example.com")
                        .totalHours(160L)
                        .extraHours(10L)
                        .nightHours(5L)
                        .absences(0L)
                        .estimatedCost(new BigDecimal("3500.00"))
                        .period("2026-06")
                        .build()
        ));

        assertEquals(true, csv.contains("'=2+3;formula@example.com;160;10;5;0;3500.00"));
    }
}
