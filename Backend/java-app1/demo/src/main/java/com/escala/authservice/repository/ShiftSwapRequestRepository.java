package com.escala.authservice.repository;

import com.escala.authservice.entity.ShiftSwapRequest;
import com.escala.authservice.entity.SwapStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShiftSwapRequestRepository extends JpaRepository<ShiftSwapRequest, Long> {
    long countByStatus(SwapStatus status);
    long countByStatusAndRequesterCompanyId(SwapStatus status, Long companyId);
}
