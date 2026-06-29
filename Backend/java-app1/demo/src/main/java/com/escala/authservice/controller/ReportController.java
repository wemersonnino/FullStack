package com.escala.authservice.controller;

import com.escala.authservice.dto.PayrollReportItem;
import com.escala.authservice.entity.User;
import com.escala.authservice.service.CurrentUserService;
import com.escala.authservice.service.PolicyService;
import com.escala.authservice.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;
    private final CurrentUserService currentUserService;
    private final PolicyService policyService;

    @GetMapping("/payroll")
    public List<PayrollReportItem> getPayrollReport(
            Authentication authentication,
            @RequestParam String month
    ) {
        User user = currentUserService.requireCurrentUser(authentication.getName());
        boolean isAdminOrOwner = policyService.isOwnerOrAdmin(user);
        if (!isAdminOrOwner) {
            throw new org.springframework.security.access.AccessDeniedException("Acesso negado: Apenas administradores podem visualizar relatorios de folha");
        }
        
        if (user.getCompany() == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Usuario nao esta vinculado a uma empresa");
        }
        
        return reportService.generatePayrollReport(user.getCompany().getId(), month);
    }

    @GetMapping("/payroll/export")
    public ResponseEntity<byte[]> exportPayroll(
            Authentication authentication,
            @RequestParam String month
    ) {
        User user = currentUserService.requireCurrentUser(authentication.getName());
        boolean isAdminOrOwner = policyService.isOwnerOrAdmin(user);
        if (!isAdminOrOwner) {
            throw new org.springframework.security.access.AccessDeniedException("Acesso negado: Apenas administradores podem exportar relatorios de folha");
        }
        
        if (user.getCompany() == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Usuario nao esta vinculado a uma empresa");
        }
        
        String normalizedMonth = reportService.normalizeMonth(month);
        List<PayrollReportItem> report = reportService.generatePayrollReport(user.getCompany().getId(), normalizedMonth);
        String csv = reportService.exportToCsv(report);

        byte[] data = csv.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=folha_" + normalizedMonth + ".csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .contentLength(data.length)
                .body(data);
    }
}
