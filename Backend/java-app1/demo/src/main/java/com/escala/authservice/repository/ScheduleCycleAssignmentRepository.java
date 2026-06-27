package com.escala.authservice.repository;

import com.escala.authservice.entity.ScheduleCycleAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleCycleAssignmentRepository extends JpaRepository<ScheduleCycleAssignment, Long> {
    List<ScheduleCycleAssignment> findByCycleIdOrderByAssignmentDateAscEmployeeFullNameAsc(Long cycleId);
    void deleteByCycleId(Long cycleId);
}
