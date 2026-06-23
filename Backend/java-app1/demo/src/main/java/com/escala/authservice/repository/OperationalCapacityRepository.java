package com.escala.authservice.repository;

import com.escala.authservice.entity.OperationalCapacity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OperationalCapacityRepository extends JpaRepository<OperationalCapacity, Long> {
    List<OperationalCapacity> findByCompanyId(Long companyId);
    List<OperationalCapacity> findByTargetIdAndTargetType(Long targetId, String targetType);
}
