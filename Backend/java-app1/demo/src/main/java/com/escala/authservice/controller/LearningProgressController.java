package com.escala.authservice.controller;

import com.escala.authservice.core.learning.application.LearningProgressService;
import com.escala.authservice.core.learning.domain.LearningProgress;
import com.escala.authservice.entity.User;
import com.escala.authservice.service.CurrentUserService;
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
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<List<LearningProgress>> getMyProgress(Authentication authentication) {
        User user = currentUserService.requireCurrentUser(authentication.getName());
        return ResponseEntity.ok(learningProgressService.getUserProgress(user.getId()));
    }

    @PostMapping
    public ResponseEntity<LearningProgress> trackProgress(@RequestBody LearningProgressRequest request, Authentication authentication) {
        User user = currentUserService.requireCurrentUser(authentication.getName());
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
    public ResponseEntity<Void> complete(@PathVariable UUID id, Authentication authentication) {
        User user = currentUserService.requireCurrentUser(authentication.getName());
        learningProgressService.markAsCompleted(id, user.getId());
        return ResponseEntity.ok().build();
    }

    public record LearningProgressRequest(String module, String topic, boolean completed, String notes) {}
}
