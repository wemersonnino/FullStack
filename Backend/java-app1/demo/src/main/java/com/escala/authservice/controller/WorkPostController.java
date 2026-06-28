package com.escala.authservice.controller;

import com.escala.authservice.entity.WorkPost;
import com.escala.authservice.service.WorkPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/work-posts")
@RequiredArgsConstructor
public class WorkPostController {
    private final WorkPostService workPostService;

    @GetMapping
    public List<WorkPost> list() {
        return workPostService.list();
    }

    @PostMapping
    public ResponseEntity<WorkPost> create(@RequestBody WorkPost workPost) {
        return ResponseEntity.ok(workPostService.create(workPost));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        workPostService.delete(id);
        return ResponseEntity.ok().build();
    }
}
