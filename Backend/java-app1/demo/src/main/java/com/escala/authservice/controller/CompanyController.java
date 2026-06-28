package com.escala.authservice.controller;

import com.escala.authservice.dto.CompanyRequest;
import com.escala.authservice.dto.CompanyResponse;
import com.escala.authservice.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyService companyService;

    @GetMapping
    public List<CompanyResponse> list() {
        return companyService.list().stream().map(CompanyResponse::from).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(CompanyResponse.from(companyService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<CompanyResponse> create(@RequestBody CompanyRequest request) {
        return ResponseEntity.ok(CompanyResponse.from(companyService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponse> update(@PathVariable UUID id, @RequestBody CompanyRequest request) {
        return ResponseEntity.ok(CompanyResponse.from(companyService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        companyService.delete(id);
        return ResponseEntity.ok().build();
    }
}
