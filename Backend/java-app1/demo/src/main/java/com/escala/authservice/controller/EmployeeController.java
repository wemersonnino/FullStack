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
    public List<Employee> list(Authentication authentication) {
        return employeeService.list(authentication.getName());
    }

    @PostMapping
    public ResponseEntity<Employee> create(Authentication authentication, @RequestBody EmployeeRequest request) {
        return ResponseEntity.ok(employeeService.create(authentication.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> update(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody EmployeeRequest request
    ) {
        return ResponseEntity.ok(employeeService.update(authentication.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(Authentication authentication, @PathVariable UUID id) {
        employeeService.remove(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
