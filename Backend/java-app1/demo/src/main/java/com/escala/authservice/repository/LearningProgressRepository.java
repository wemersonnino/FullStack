package com.escala.authservice.repository;

import com.escala.authservice.entity.LearningProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface LearningProgressRepository extends JpaRepository<LearningProgressEntity, UUID> {
    List<LearningProgressEntity> findByUserId(UUID userId);
}
