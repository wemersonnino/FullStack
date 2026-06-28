package com.escala.authservice.controller;

import com.escala.authservice.dto.EmployeeRequest;
import com.escala.authservice.entity.Employee;
import com.escala.authservice.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {
    private final EmployeeService employeeService;

    @GetMapping
    public org.springframework.data.domain.Page<com.escala.authservice.dto.EmployeeResponse> list(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return employeeService.list(authentication.getName(), pageable).map(com.escala.authservice.dto.EmployeeResponse::from);
    }

    @PostMapping
    public ResponseEntity<com.escala.authservice.dto.EmployeeResponse> create(Authentication authentication, @RequestBody EmployeeRequest request) {
        return ResponseEntity.ok(com.escala.authservice.dto.EmployeeResponse.from(employeeService.create(authentication.getName(), request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<com.escala.authservice.dto.EmployeeResponse> update(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody EmployeeRequest request
    ) {
        return ResponseEntity.ok(com.escala.authservice.dto.EmployeeResponse.from(employeeService.update(authentication.getName(), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(Authentication authentication, @PathVariable UUID id) {
        employeeService.remove(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
