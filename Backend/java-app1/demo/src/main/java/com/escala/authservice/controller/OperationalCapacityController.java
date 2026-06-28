package com.escala.authservice.controller;

import com.escala.authservice.dto.OperationalCapacityRequest;
import com.escala.authservice.entity.OperationalCapacity;
import com.escala.authservice.service.OperationalCapacityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/operational-capacities")
@RequiredArgsConstructor
public class OperationalCapacityController {

    private final OperationalCapacityService operationalCapacityService;

    @GetMapping
    public ResponseEntity<List<OperationalCapacity>> listCapacities(Authentication authentication) {
        return ResponseEntity.ok(operationalCapacityService.listCapacities(authentication.getName()));
    }

    @GetMapping("/target")
    public ResponseEntity<List<OperationalCapacity>> listByTarget(
            Authentication authentication,
            @RequestParam UUID targetId,
            @RequestParam String targetType
    ) {
        return ResponseEntity.ok(operationalCapacityService.listByTarget(authentication.getName(), targetId, targetType));
    }

    @PostMapping
    public ResponseEntity<OperationalCapacity> createCapacity(
            Authentication authentication,
            @RequestBody OperationalCapacityRequest request
    ) {
        return ResponseEntity.ok(operationalCapacityService.createCapacity(authentication.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OperationalCapacity> updateCapacity(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody OperationalCapacityRequest request
    ) {
        return ResponseEntity.ok(operationalCapacityService.updateCapacity(authentication.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCapacity(
            Authentication authentication,
            @PathVariable UUID id
    ) {
        operationalCapacityService.deleteCapacity(authentication.getName(), id);
        return ResponseEntity.ok().build();
    }
}
