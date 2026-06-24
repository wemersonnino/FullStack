package com.escala.authservice.controller;

import com.escala.authservice.dto.rebac.*;
import com.escala.authservice.entity.ManagerRoleLevel;
import com.escala.authservice.entity.ManagerScopeType;
import com.escala.authservice.service.RebacAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rebac")
@RequiredArgsConstructor
public class RebacAdminController {
    private final RebacAdminService rebacAdminService;

    @GetMapping("/manager-assignments")
    public List<ManagerAssignmentResponse> assignments(Authentication authentication) {
        return rebacAdminService.listAssignments(authentication.getName());
    }

    @PostMapping("/manager-assignments")
    public ResponseEntity<ManagerAssignmentResponse> createAssignment(Authentication authentication, @RequestBody ManagerAssignmentRequest request) {
        return ResponseEntity.ok(rebacAdminService.createAssignment(authentication.getName(), request));
    }

    @DeleteMapping("/manager-assignments/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteAssignment(Authentication authentication, @PathVariable Long id) {
        rebacAdminService.deleteAssignment(authentication.getName(), id);
        return ResponseEntity.ok(Map.of("deleted", true));
    }

    @GetMapping("/management-edges")
    public List<ManagementEdgeResponse> edges(Authentication authentication) {
        return rebacAdminService.listEdges(authentication.getName());
    }

    @PostMapping("/management-edges")
    public ResponseEntity<ManagementEdgeResponse> createEdge(Authentication authentication, @RequestBody ManagementEdgeRequest request) {
        return ResponseEntity.ok(rebacAdminService.createEdge(authentication.getName(), request));
    }

    @DeleteMapping("/management-edges/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteEdge(Authentication authentication, @PathVariable Long id) {
        rebacAdminService.deleteEdge(authentication.getName(), id);
        return ResponseEntity.ok(Map.of("deleted", true));
    }

    @GetMapping("/management-closure")
    public List<ManagementClosureResponse> closure(Authentication authentication) {
        return rebacAdminService.listClosure(authentication.getName());
    }

    @PostMapping("/management-closure/recalculate")
    public ResponseEntity<List<ManagementClosureResponse>> recalculateClosure(Authentication authentication) {
        return ResponseEntity.ok(rebacAdminService.recalculateClosure(authentication.getName()));
    }

    @GetMapping("/enums/manager-scope-types")
    public List<Map<String, Object>> managerScopeTypes(Authentication authentication) {
        rebacAdminService.requireAdminCatalogAccess(authentication.getName());
        return Arrays.stream(ManagerScopeType.values())
                .map(value -> Map.<String, Object>of("name", value.name()))
                .toList();
    }

    @GetMapping("/enums/manager-role-levels")
    public List<Map<String, Object>> managerRoleLevels(Authentication authentication) {
        rebacAdminService.requireAdminCatalogAccess(authentication.getName());
        return Arrays.stream(ManagerRoleLevel.values())
                .map(value -> Map.<String, Object>of("name", value.name(), "weight", value.getWeight()))
                .toList();
    }
}
