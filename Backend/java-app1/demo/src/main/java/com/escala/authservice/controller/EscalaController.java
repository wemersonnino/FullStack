package com.escala.authservice.controller;

import com.escala.authservice.dto.escala.EscalaRequest;
import com.escala.authservice.dto.escala.EscalaResponse;
import com.escala.authservice.dto.escala.UsuarioEscalaResponse;
import com.escala.authservice.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/escala")
@RequiredArgsConstructor
public class EscalaController {
    private final ScheduleService scheduleService;

    @GetMapping("/me")
    public List<EscalaResponse> minhasEscalas(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return scheduleService.listEscalasDoUsuario(authentication.getName(), inicio, fim);
    }

    @GetMapping
    public List<EscalaResponse> escalas(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false) UUID usuarioId,
            @RequestParam(required = false) UUID setorId,
            @RequestParam(required = false) UUID projetoId
    ) {
        requireAdmin(authentication);
        return scheduleService.listEscalas(inicio, fim, usuarioId, setorId, projetoId, authentication.getName());
    }

    @GetMapping("/dia")
    public List<EscalaResponse> escalasDoDia(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data
    ) {
        return scheduleService.listEscalasDoDia(data, authentication.getName(), isAdmin(authentication));
    }

    @PostMapping
    public ResponseEntity<List<EscalaResponse>> criar(Authentication authentication, @RequestBody EscalaRequest request) {
        requireAdmin(authentication);
        return ResponseEntity.ok(scheduleService.createEscalas(request, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EscalaResponse> atualizar(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody EscalaRequest request
    ) {
        requireAdmin(authentication);
        return ResponseEntity.ok(scheduleService.updateEscala(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> remover(Authentication authentication, @PathVariable UUID id) {
        requireAdmin(authentication);
        scheduleService.cancelEscala(id, authentication.getName());
        return ResponseEntity.ok(Map.of("deleted", true));
    }

    @GetMapping("/usuarios")
    public List<UsuarioEscalaResponse> usuarios(
            Authentication authentication,
            @RequestParam(required = false) UUID projetoId,
            @RequestParam(required = false) UUID setorId,
            @RequestParam(required = false) UUID empresaId,
            @RequestParam(required = false, name = "q") String query
    ) {
        requireAdmin(authentication);
        return scheduleService.usuariosEscalaveis(projetoId, setorId, empresaId, query, authentication.getName());
    }

    @GetMapping("/usuarios/{id}")
    public UsuarioEscalaResponse usuario(Authentication authentication, @PathVariable UUID id) {
        requireAdmin(authentication);
        return scheduleService.usuarioEscalavel(id, authentication.getName());
    }

    private void requireAdmin(Authentication authentication) {
        if (!isAdmin(authentication)) {
            throw new org.springframework.security.access.AccessDeniedException("Permissao de gestor requerida");
        }
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ADMIN") || role.equals("OWNER") || role.equals("MANAGER") || role.startsWith("MANAGER_"));
    }
}
