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
    public List<Sector> sectors(Authentication authentication) {
        return organizationService.sectors(authentication.getName());
    }

    @PostMapping("/sectors")
    public ResponseEntity<Sector> createSector(Authentication authentication, @RequestBody SectorRequest request) {
        return ResponseEntity.ok(organizationService.createSector(authentication.getName(), request));
    }

    @PutMapping("/sectors/{id}")
    public ResponseEntity<Sector> updateSector(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody SectorRequest request
    ) {
        return ResponseEntity.ok(organizationService.updateSector(authentication.getName(), id, request));
    }

    @DeleteMapping("/sectors/{id}")
    public ResponseEntity<Void> deleteSector(Authentication authentication, @PathVariable UUID id) {
        organizationService.deleteSector(authentication.getName(), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/projects")
    public List<Project> projects(Authentication authentication) {
        return organizationService.projects(authentication.getName());
    }

    @PostMapping("/projects")
    public ResponseEntity<Project> createProject(Authentication authentication, @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(organizationService.createProject(authentication.getName(), request));
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<Project> updateProject(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody ProjectRequest request
    ) {
        return ResponseEntity.ok(organizationService.updateProject(authentication.getName(), id, request));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(Authentication authentication, @PathVariable UUID id) {
        organizationService.deleteProject(authentication.getName(), id);
        return ResponseEntity.ok().build();
    }
}
