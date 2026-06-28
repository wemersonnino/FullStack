package com.escala.authservice.repository;

import com.escala.authservice.entity.ScheduleValidationAcknowledgement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.UUID;
import java.util.List;
import java.util.Optional;

public interface ScheduleValidationAcknowledgementRepository extends JpaRepository<ScheduleValidationAcknowledgement, UUID> {
    Optional<ScheduleValidationAcknowledgement> findByCycleIdAndAlertId(UUID cycleId, String alertId);
    List<ScheduleValidationAcknowledgement> findByCycleIdAndAlertIdIn(UUID cycleId, Collection<String> alertIds);
}
