package com.escala.authservice.repository;

import com.escala.authservice.entity.ScheduleCycleAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ScheduleCycleAssignmentRepository extends JpaRepository<ScheduleCycleAssignment, UUID> {
    List<ScheduleCycleAssignment> findByCycleIdOrderByAssignmentDateAscEmployeeFullNameAsc(UUID cycleId);
    void deleteByCycleId(UUID cycleId);
}
