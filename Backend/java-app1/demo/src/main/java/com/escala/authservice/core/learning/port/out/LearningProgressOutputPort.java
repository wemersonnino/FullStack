package com.escala.authservice.core.learning.port.out;

import com.escala.authservice.core.learning.domain.LearningProgress;
import java.util.List;
import java.util.Optional;

public interface LearningProgressOutputPort {
    LearningProgress save(LearningProgress progress);
    List<LearningProgress> findByUserId(Long userId);
    Optional<LearningProgress> findById(Long id);
    void delete(Long id);
}
