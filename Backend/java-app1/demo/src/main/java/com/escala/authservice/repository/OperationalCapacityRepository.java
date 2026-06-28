package com.escala.authservice.repository;

import com.escala.authservice.entity.OperationalCapacity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface OperationalCapacityRepository extends JpaRepository<OperationalCapacity, UUID> {
    List<OperationalCapacity> findByCompanyId(UUID companyId);
    List<OperationalCapacity> findByTargetIdAndTargetType(UUID targetId, String targetType);
}
