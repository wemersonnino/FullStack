package com.escala.authservice.repository;

import com.escala.authservice.entity.ScheduleValidationAcknowledgement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ScheduleValidationAcknowledgementRepository extends JpaRepository<ScheduleValidationAcknowledgement, Long> {
    Optional<ScheduleValidationAcknowledgement> findByCycleIdAndAlertId(Long cycleId, String alertId);
    List<ScheduleValidationAcknowledgement> findByCycleIdAndAlertIdIn(Long cycleId, Collection<String> alertIds);
}
