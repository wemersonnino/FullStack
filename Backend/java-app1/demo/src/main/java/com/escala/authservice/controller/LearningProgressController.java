package com.escala.authservice.controller;

import com.escala.authservice.core.learning.application.LearningProgressService;
import com.escala.authservice.core.learning.domain.LearningProgress;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/learning-progress")
@RequiredArgsConstructor
public class LearningProgressController {
    private final LearningProgressService learningProgressService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<LearningProgress>> getMyProgress(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(learningProgressService.getUserProgress(user.getId()));
    }

    @PostMapping
    public ResponseEntity<LearningProgress> trackProgress(@RequestBody LearningProgressRequest request, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        LearningProgress progress = LearningProgress.builder()
                .userId(user.getId())
                .module(request.module())
                .topic(request.topic())
                .completed(request.completed())
                .notes(request.notes())
                .build();
        return ResponseEntity.ok(learningProgressService.track(progress));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Void> complete(@PathVariable UUID id) {
        learningProgressService.markAsCompleted(id);
        return ResponseEntity.ok().build();
    }

    public record LearningProgressRequest(String module, String topic, boolean completed, String notes) {}
}
