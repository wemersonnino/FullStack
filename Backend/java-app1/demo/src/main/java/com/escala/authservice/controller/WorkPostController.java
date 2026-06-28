package com.escala.authservice.controller;

import com.escala.authservice.entity.WorkPost;
import com.escala.authservice.service.WorkPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/work-posts")
@RequiredArgsConstructor
public class WorkPostController {
    private final WorkPostService workPostService;

    @GetMapping
    public List<WorkPost> list(Authentication authentication) {
        return workPostService.list(authentication.getName());
    }

    @PostMapping
    public ResponseEntity<WorkPost> create(Authentication authentication, @RequestBody WorkPost workPost) {
        return ResponseEntity.ok(workPostService.create(authentication.getName(), workPost));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable UUID id) {
        workPostService.delete(authentication.getName(), id);
        return ResponseEntity.ok().build();
    }
}
