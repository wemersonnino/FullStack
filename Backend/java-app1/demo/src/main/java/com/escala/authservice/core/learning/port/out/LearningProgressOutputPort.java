package com.escala.authservice.core.learning.port.out;

import com.escala.authservice.core.learning.domain.LearningProgress;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

public interface LearningProgressOutputPort {
    LearningProgress save(LearningProgress progress);
    List<LearningProgress> findByUserId(UUID userId);
    Optional<LearningProgress> findById(UUID id);
    void delete(UUID id);
}
