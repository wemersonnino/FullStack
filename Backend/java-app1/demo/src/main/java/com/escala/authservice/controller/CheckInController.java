package com.escala.authservice.controller;

import com.escala.authservice.dto.CheckInRequest;
import com.escala.authservice.service.ClientIpResolver;
import com.escala.authservice.service.CheckInService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/check-in")
@RequiredArgsConstructor
public class CheckInController {
    private final CheckInService checkInService;
    private final ClientIpResolver clientIpResolver;

    @PostMapping
    public ResponseEntity<Map<String, String>> register(
            Authentication authentication,
            @RequestBody CheckInRequest request,
            HttpServletRequest servletRequest
    ) {
        String ipAddress = clientIpResolver.resolve(servletRequest);

        checkInService.validateAndRegister(authentication.getName(), request, ipAddress);

        return ResponseEntity.ok(Map.of("message", "Ponto registrado com sucesso dentro da área permitida"));
    }
}
