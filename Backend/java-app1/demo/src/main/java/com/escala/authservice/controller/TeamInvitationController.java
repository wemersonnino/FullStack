package com.escala.authservice.controller;

import com.escala.authservice.dto.TeamInvitationRequest;
import com.escala.authservice.dto.TeamInvitationResponse;
import com.escala.authservice.service.TeamInvitationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/team/invitations")
@RequiredArgsConstructor
public class TeamInvitationController {
    private final TeamInvitationService invitationService;

    @PostMapping
    public ResponseEntity<TeamInvitationResponse> invite(
            Authentication authentication,
            @RequestBody TeamInvitationRequest request
    ) {
        return ResponseEntity.ok(TeamInvitationResponse.from(invitationService.invite(authentication.getName(), request)));
    }

    @GetMapping
    public List<TeamInvitationResponse> list(Authentication authentication) {
        return invitationService.listByCompany(authentication.getName())
                .stream()
                .map(TeamInvitationResponse::from)
                .toList();
    }

    @GetMapping("/token/{token}")
    public ResponseEntity<TeamInvitationResponse> findByToken(@PathVariable String token) {
        return ResponseEntity.ok(TeamInvitationResponse.from(invitationService.findByToken(token)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(Authentication authentication, @PathVariable UUID id) {
        invitationService.cancel(authentication.getName(), id);
        return ResponseEntity.ok().build();
    }
}
