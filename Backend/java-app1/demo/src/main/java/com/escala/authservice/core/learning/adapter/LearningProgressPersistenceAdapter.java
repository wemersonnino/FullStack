package com.escala.authservice.core.learning.adapter;

import com.escala.authservice.core.learning.domain.LearningProgress;
import com.escala.authservice.core.learning.port.out.LearningProgressOutputPort;
import com.escala.authservice.entity.LearningProgressEntity;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.LearningProgressRepository;
import com.escala.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class LearningProgressPersistenceAdapter implements LearningProgressOutputPort {
    private final LearningProgressRepository repository;
    private final UserRepository userRepository;

    @Override
    public LearningProgress save(LearningProgress domain) {
        User user = userRepository.findById(domain.getUserId()).orElseThrow();
        LearningProgressEntity entity = LearningProgressEntity.builder()
                .id(domain.getId())
                .user(user)
                .module(domain.getModule())
                .topic(domain.getTopic())
                .completed(domain.isCompleted())
                .completionDate(domain.getCompletionDate())
                .notes(domain.getNotes())
                .build();
        
        LearningProgressEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public List<LearningProgress> findByUserId(UUID userId) {
        return repository.findByUserId(userId).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Optional<LearningProgress> findById(UUID id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public void delete(UUID id) {
        repository.deleteById(id);
    }

    private LearningProgress toDomain(LearningProgressEntity entity) {
        return LearningProgress.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .module(entity.getModule())
                .topic(entity.getTopic())
                .completed(entity.isCompleted())
                .completionDate(entity.getCompletionDate())
                .notes(entity.getNotes())
                .build();
    }
}
