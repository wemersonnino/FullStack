package com.escala.authservice.repository;

import com.escala.authservice.entity.LearningProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LearningProgressRepository extends JpaRepository<LearningProgressEntity, Long> {
    List<LearningProgressEntity> findByUserId(Long userId);
}
