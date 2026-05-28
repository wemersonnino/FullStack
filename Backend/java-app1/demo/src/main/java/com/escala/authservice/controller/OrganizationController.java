package com.escala.authservice.controller;

import com.escala.authservice.dto.ProjectRequest;
import com.escala.authservice.dto.SectorRequest;
import com.escala.authservice.entity.Project;
import com.escala.authservice.entity.Sector;
import com.escala.authservice.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/organization")
@RequiredArgsConstructor
public class OrganizationController {
    private final OrganizationService organizationService;

    @GetMapping("/sectors")
    public List<Sector> sectors() {
        return organizationService.sectors();
    }

    @PostMapping("/sectors")
    public ResponseEntity<Sector> createSector(@RequestBody SectorRequest request) {
        return ResponseEntity.ok(organizationService.createSector(request));
    }

    @PutMapping("/sectors/{id}")
    public ResponseEntity<Sector> updateSector(@PathVariable Long id, @RequestBody SectorRequest request) {
        return ResponseEntity.ok(organizationService.updateSector(id, request));
    }

    @DeleteMapping("/sectors/{id}")
    public ResponseEntity<Void> deleteSector(@PathVariable Long id) {
        organizationService.deleteSector(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/projects")
    public List<Project> projects() {
        return organizationService.projects();
    }

    @PostMapping("/projects")
    public ResponseEntity<Project> createProject(@RequestBody ProjectRequest request) {
        return ResponseEntity.ok(organizationService.createProject(request));
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(organizationService.updateProject(id, request));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        organizationService.deleteProject(id);
        return ResponseEntity.ok().build();
    }
}
