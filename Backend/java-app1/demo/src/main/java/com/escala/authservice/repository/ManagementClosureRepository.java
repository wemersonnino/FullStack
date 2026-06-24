package com.escala.authservice.repository;

import com.escala.authservice.entity.ManagementClosure;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ManagementClosureRepository extends JpaRepository<ManagementClosure, Long> {
    boolean existsByCompanyIdAndAncestorIdAndDescendantId(Long companyId, Long ancestorId, Long descendantId);
    List<ManagementClosure> findByCompanyIdOrderByAncestorUsernameAscDepthAscDescendantUsernameAsc(Long companyId);
    void deleteByCompanyId(Long companyId);
}
