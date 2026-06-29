package com.escala.authservice.service;

import com.escala.authservice.dto.TeamInvitationRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.TeamInvitation;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.TeamInvitationRepository;
import com.escala.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TeamInvitationService {
    private static final Set<String> ALLOWED_INVITE_ROLES = Set.of("USER", "MANAGER", "ADMIN", "OWNER");

    private final TeamInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final PolicyService policyService;

    public TeamInvitation invite(String inviterEmail, TeamInvitationRequest request) {
        User inviter = userRepository.findByEmail(inviterEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inviter not found"));
        policyService.requireOwnerOrAdmin(inviter, "Apenas OWNER ou ADMIN podem convidar usuarios");
        
        Company company = inviter.getCompany();
        if (company == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Inviter must belong to a company");
        }

        String email = normalizeEmail(request.getEmail());
        String roleName = normalizeRole(request.getRoleName());
        if (("OWNER".equals(roleName) || "ADMIN".equals(roleName)) && !policyService.isOwner(inviter)) {
            throw new AccessDeniedException("Somente OWNER pode convidar perfis OWNER ou ADMIN");
        }

        // Check if user already exists in this company
        if (userRepository.findByEmailAndCompanySlug(email, company.getSlug()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User already belongs to this company");
        }

        // Deactivate previous invitations for this email in this company
        invitationRepository.findByEmailAndCompanyId(email, company.getId())
                .ifPresent(existing -> {
                    existing.setActive(false);
                    invitationRepository.save(existing);
                });

        TeamInvitation invitation = TeamInvitation.builder()
                .email(email)
                .roleName(roleName)
                .token(UUID.randomUUID().toString())
                .company(company)
                .invitedBy(inviter)
                .expiresAt(OffsetDateTime.now().plusDays(7))
                .build();

        return invitationRepository.save(invitation);
    }

    public List<TeamInvitation> listByCompany(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        policyService.requireOwnerOrAdmin(user, "Apenas OWNER ou ADMIN podem listar convites");
        if (user.getCompany() == null) return List.of();
        return invitationRepository.findByCompanyId(user.getCompany().getId());
    }

    public TeamInvitation findByToken(String token) {
        return invitationRepository.findByToken(token)
                .filter(TeamInvitation::isUsable)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found or expired"));
    }

    public void cancel(String userEmail, UUID invitationId) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        policyService.requireOwnerOrAdmin(user, "Apenas OWNER ou ADMIN podem cancelar convites");
        TeamInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));

        if (!invitation.getCompany().getId().equals(user.getCompany().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        invitation.setActive(false);
        invitationRepository.save(invitation);
    }

    private String normalizeEmail(String value) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email do convite e obrigatorio");
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeRole(String value) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role do convite e obrigatoria");
        }

        String normalized = value.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_INVITE_ROLES.contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role do convite invalida");
        }
        return normalized;
    }
}
