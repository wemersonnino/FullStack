package com.escala.authservice.controller;

import com.escala.authservice.dto.audit.AuditLogPageResponse;
import com.escala.authservice.service.AuditLogQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {
    private final AuditLogQueryService auditLogQueryService;

    @GetMapping
    public AuditLogPageResponse search(
            Authentication authentication,
            @RequestParam(required = false) String actor,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return auditLogQueryService.search(authentication.getName(), actor, action, entityType, page, size);
    }
}
