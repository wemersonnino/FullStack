package com.escala.authservice.controller;

import com.escala.authservice.dto.ProjectRequest;
import com.escala.authservice.dto.SectorRequest;
import com.escala.authservice.entity.Project;
import com.escala.authservice.entity.Sector;
import com.escala.authservice.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organization")
@RequiredArgsConstructor
public class OrganizationController {
    private final OrganizationService organizationService;

    @GetMapping("/sectors")
    public org.springframework.data.domain.Page<com.escala.authservice.dto.SectorResponse> sectors(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return organizationService.sectors(authentication.getName(), pageable).map(com.escala.authservice.dto.SectorResponse::from);
    }

    @PostMapping("/sectors")
    public ResponseEntity<com.escala.authservice.dto.SectorResponse> createSector(Authentication authentication, @RequestBody SectorRequest request) {
        return ResponseEntity.ok(com.escala.authservice.dto.SectorResponse.from(organizationService.createSector(authentication.getName(), request)));
    }

    @PutMapping("/sectors/{id}")
    public ResponseEntity<com.escala.authservice.dto.SectorResponse> updateSector(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody SectorRequest request
    ) {
        return ResponseEntity.ok(com.escala.authservice.dto.SectorResponse.from(organizationService.updateSector(authentication.getName(), id, request)));
    }

    @DeleteMapping("/sectors/{id}")
    public ResponseEntity<Void> deleteSector(Authentication authentication, @PathVariable UUID id) {
        organizationService.deleteSector(authentication.getName(), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/projects")
    public org.springframework.data.domain.Page<com.escala.authservice.dto.ProjectResponse> projects(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return organizationService.projects(authentication.getName(), pageable).map(com.escala.authservice.dto.ProjectResponse::from);
    }

    @PostMapping("/projects")
    public ResponseEntity<com.escala.authservice.dto.ProjectResponse> createProject(Authentication authentication, @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(com.escala.authservice.dto.ProjectResponse.from(organizationService.createProject(authentication.getName(), request)));
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<com.escala.authservice.dto.ProjectResponse> updateProject(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody ProjectRequest request
    ) {
        return ResponseEntity.ok(com.escala.authservice.dto.ProjectResponse.from(organizationService.updateProject(authentication.getName(), id, request)));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(Authentication authentication, @PathVariable UUID id) {
        organizationService.deleteProject(authentication.getName(), id);
        return ResponseEntity.ok().build();
    }
}
