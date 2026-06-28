package com.escala.authservice.controller;

import com.escala.authservice.dto.CompanyRequest;
import com.escala.authservice.dto.CompanyResponse;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.UserRepository;
import com.escala.authservice.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyService companyService;
    private final UserRepository userRepository;

    @GetMapping
    public List<CompanyResponse> list(Authentication authentication) {
        User requester = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario requisitante nao encontrado"));
        
        boolean isSystemAdmin = requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("SYSTEM_ADMIN"));
        
        if (isSystemAdmin) {
            return companyService.list().stream().map(CompanyResponse::from).toList();
        } else {
            if (requester.getCompany() == null) {
                return List.of();
            }
            return List.of(CompanyResponse.from(requester.getCompany()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> findById(Authentication authentication, @PathVariable UUID id) {
        User requester = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario requisitante nao encontrado"));
        
        boolean isSystemAdmin = requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("SYSTEM_ADMIN"));
        
        if (!isSystemAdmin && (requester.getCompany() == null || !requester.getCompany().getId().equals(id))) {
            throw new AccessDeniedException("Nao autorizado a visualizar dados de outra empresa");
        }
        
        return ResponseEntity.ok(CompanyResponse.from(companyService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<CompanyResponse> create(Authentication authentication, @RequestBody CompanyRequest request) {
        User requester = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario requisitante nao encontrado"));
        
        boolean isSystemAdmin = requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("SYSTEM_ADMIN"));
        
        if (!isSystemAdmin) {
            throw new AccessDeniedException("Apenas administradores do sistema podem criar empresas diretamente");
        }
        
        return ResponseEntity.ok(CompanyResponse.from(companyService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponse> update(Authentication authentication, @PathVariable UUID id, @RequestBody CompanyRequest request) {
        User requester = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario requisitante nao encontrado"));
        
        boolean isSystemAdmin = requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("SYSTEM_ADMIN"));
        
        if (!isSystemAdmin && (requester.getCompany() == null || !requester.getCompany().getId().equals(id))) {
            throw new AccessDeniedException("Nao autorizado a alterar dados de outra empresa");
        }
        
        return ResponseEntity.ok(CompanyResponse.from(companyService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable UUID id) {
        User requester = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario requisitante nao encontrado"));
        
        boolean isSystemAdmin = requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("SYSTEM_ADMIN"));
        
        if (!isSystemAdmin) {
            throw new AccessDeniedException("Apenas administradores do sistema podem excluir empresas");
        }
        
        companyService.delete(id);
        return ResponseEntity.ok().build();
    }
}
