package com.escala.authservice.repository;

import com.escala.authservice.entity.ShiftSwapRequest;
import com.escala.authservice.entity.SwapStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ShiftSwapRequestRepository extends JpaRepository<ShiftSwapRequest, UUID> {
    long countByStatus(SwapStatus status);
    long countByStatusAndRequesterCompanyId(SwapStatus status, UUID companyId);
    List<ShiftSwapRequest> findByRequesterCompanyIdOrderByCreatedAtDesc(UUID companyId);
}
