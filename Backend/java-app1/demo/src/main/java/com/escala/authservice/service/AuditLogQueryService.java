package com.escala.authservice.service;

import com.escala.authservice.dto.audit.AuditLogPageResponse;
import com.escala.authservice.dto.audit.AuditLogResponse;
import com.escala.authservice.dto.audit.AuditSummaryResponse;
import com.escala.authservice.entity.AuditLog;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.AuditLogRepository;
import com.escala.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;
import java.time.OffsetDateTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class AuditLogQueryService {
    private static final int MAX_PAGE_SIZE = 100;

    private final AuditLogRepository auditLogRepository;
    private final PolicyService policyService;
    private final CurrentUserService currentUserService;

    public AuditLogPageResponse search(String requesterEmail, String actor, String action, String entityType, int page, int size) {
        User requester = currentUserService.requireCurrentUser(requesterEmail);
        if (!policyService.isOwnerOrAdmin(requester)) {
            throw new AccessDeniedException("Apenas OWNER ou ADMIN podem consultar auditoria");
        }
        if (requester.getCompany() == null) {
            throw new AccessDeniedException("Usuario sem empresa nao pode consultar auditoria");
        }

        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, MAX_PAGE_SIZE));
        UUID companyId = requester.getCompany().getId();

        Page<AuditLog> result = auditLogRepository.searchByCompany(
                companyId,
                blankToNull(actor),
                blankToNull(action),
                blankToNull(entityType),
                PageRequest.of(safePage, safeSize)
        );

        return AuditLogPageResponse.builder()
                .items(result.getContent().stream().map(AuditLogResponse::from).toList())
                .summary(summary(companyId))
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    private AuditSummaryResponse summary(UUID companyId) {
        ZoneId zone = ZoneId.systemDefault();
        OffsetDateTime start = LocalDate.now(zone).atStartOfDay(zone).toOffsetDateTime();
        OffsetDateTime end = start.plusDays(1);

        return AuditSummaryResponse.builder()
                .eventsToday(auditLogRepository.countByCompanyIdAndCreatedAtBetween(companyId, start, end))
                .totalEvents(auditLogRepository.countByCompanyId(companyId))
                .integrityPercent(100)
                .lastEventAt(auditLogRepository.findFirstByCompanyIdOrderByCreatedAtDesc(companyId)
                        .map(AuditLog::getCreatedAt)
                        .orElse(null))
                .build();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
