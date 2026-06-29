package com.escala.authservice.controller;

import com.escala.authservice.dto.TeamInvitationRequest;
import com.escala.authservice.dto.TeamInvitationResponse;
import com.escala.authservice.service.TeamInvitationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @PostMapping
    public ResponseEntity<TeamInvitationResponse> invite(
            Authentication authentication,
            @RequestBody TeamInvitationRequest request
    ) {
        var invitation = invitationService.invite(authentication.getName(), request);
        return ResponseEntity.ok(TeamInvitationResponse.forAdmin(invitation, inviteUrl(invitation.getToken())));
    }

    @GetMapping
    public List<TeamInvitationResponse> list(Authentication authentication) {
        return invitationService.listByCompany(authentication.getName())
                .stream()
                .map(invitation -> TeamInvitationResponse.forAdmin(invitation, inviteUrl(invitation.getToken())))
                .toList();
    }

    @GetMapping("/token/{token}")
    public ResponseEntity<TeamInvitationResponse> findByToken(@PathVariable String token) {
        return ResponseEntity.ok(TeamInvitationResponse.forPublic(invitationService.findByToken(token)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(Authentication authentication, @PathVariable UUID id) {
        invitationService.cancel(authentication.getName(), id);
        return ResponseEntity.ok().build();
    }

    private String inviteUrl(String token) {
        return frontendBaseUrl.replaceAll("/+$", "") + "/invite/" + token;
    }
}
