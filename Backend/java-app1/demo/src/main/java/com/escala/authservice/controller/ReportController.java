package com.escala.authservice.controller;

import com.escala.authservice.dto.PayrollReportItem;
import com.escala.authservice.entity.User;
import com.escala.authservice.service.ReportService;
import com.escala.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;
    private final UserRepository userRepository;

    @GetMapping("/payroll")
    public List<PayrollReportItem> getPayrollReport(
            Authentication authentication,
            @RequestParam String month
    ) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return reportService.generatePayrollReport(user.getCompany().getId(), month);
    }

    @GetMapping("/payroll/export")
    public ResponseEntity<byte[]> exportPayroll(
            Authentication authentication,
            @RequestParam String month
    ) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        List<PayrollReportItem> report = reportService.generatePayrollReport(user.getCompany().getId(), month);
        String csv = reportService.exportToCsv(report);

        byte[] data = csv.getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=folha_" + month + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(data.length)
                .body(data);
    }
}
