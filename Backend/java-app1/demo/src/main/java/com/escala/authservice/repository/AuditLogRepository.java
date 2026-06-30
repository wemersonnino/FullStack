package com.escala.authservice.repository;

import com.escala.authservice.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.Optional;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    @Query("""
            select a from AuditLog a
            where a.company.id = :companyId
              and (:actor is null or lower(a.actor) like lower(concat('%', cast(:actor as string), '%')))
              and (:action is null or lower(a.action) like lower(concat('%', cast(:action as string), '%')))
              and (:entityType is null or lower(a.entityType) = lower(:entityType))
            order by a.createdAt desc
            """)
    Page<AuditLog> searchByCompany(
            @Param("companyId") UUID companyId,
            @Param("actor") String actor,
            @Param("action") String action,
            @Param("entityType") String entityType,
            Pageable pageable
    );

    long countByCompanyIdAndCreatedAtBetween(UUID companyId, OffsetDateTime start, OffsetDateTime end);

    long countByCompanyId(UUID companyId);

    Optional<AuditLog> findFirstByCompanyIdOrderByCreatedAtDesc(UUID companyId);
}
