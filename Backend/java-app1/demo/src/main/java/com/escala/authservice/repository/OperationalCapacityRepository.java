package com.escala.authservice.repository;

import com.escala.authservice.entity.OperationalCapacity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface OperationalCapacityRepository extends JpaRepository<OperationalCapacity, UUID> {
    List<OperationalCapacity> findByCompanyIdAndActiveTrue(UUID companyId);
    List<OperationalCapacity> findByCompanyIdAndTargetIdAndTargetTypeAndActiveTrue(UUID companyId, UUID targetId, String targetType);
}
