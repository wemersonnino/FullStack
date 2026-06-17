package com.escala.authservice.core.learning.application;

import com.escala.authservice.core.learning.domain.LearningProgress;
import com.escala.authservice.core.learning.port.out.LearningProgressOutputPort;
import lombok.RequiredArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@RequiredArgsConstructor
public class LearningProgressService {
    private final LearningProgressOutputPort outputPort;

    public LearningProgress track(LearningProgress progress) {
        if (progress.isCompleted() && progress.getCompletionDate() == null) {
            progress.setCompletionDate(OffsetDateTime.now());
        }
        return outputPort.save(progress);
    }

    public List<LearningProgress> getUserProgress(Long userId) {
        return outputPort.findByUserId(userId);
    }

    public void markAsCompleted(Long id) {
        outputPort.findById(id).ifPresent(p -> {
            p.setCompleted(true);
            p.setCompletionDate(OffsetDateTime.now());
            outputPort.save(p);
        });
    }
}
