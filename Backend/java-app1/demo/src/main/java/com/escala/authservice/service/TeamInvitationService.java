package com.escala.authservice.service;

import com.escala.authservice.dto.TeamInvitationRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.TeamInvitation;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.TeamInvitationRepository;
import com.escala.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TeamInvitationService {
    private final TeamInvitationRepository invitationRepository;
    private final UserRepository userRepository;

    public TeamInvitation invite(String inviterEmail, TeamInvitationRequest request) {
        User inviter = userRepository.findByEmail(inviterEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inviter not found"));
        
        Company company = inviter.getCompany();
        if (company == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Inviter must belong to a company");
        }

        // Check if user already exists in this company
        if (userRepository.findByEmailAndCompanySlug(request.getEmail(), company.getSlug()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User already belongs to this company");
        }

        // Deactivate previous invitations for this email in this company
        invitationRepository.findByEmailAndCompanyId(request.getEmail(), company.getId())
                .ifPresent(existing -> {
                    existing.setActive(false);
                    invitationRepository.save(existing);
                });

        TeamInvitation invitation = TeamInvitation.builder()
                .email(request.getEmail().trim().toLowerCase())
                .roleName(request.getRoleName())
                .token(UUID.randomUUID().toString())
                .company(company)
                .invitedBy(inviter)
                .expiresAt(OffsetDateTime.now().plusDays(7))
                .build();

        return invitationRepository.save(invitation);
    }

    public List<TeamInvitation> listByCompany(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        if (user.getCompany() == null) return List.of();
        return invitationRepository.findByCompanyId(user.getCompany().getId());
    }

    public TeamInvitation findByToken(String token) {
        return invitationRepository.findByToken(token)
                .filter(TeamInvitation::isUsable)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found or expired"));
    }

    public void cancel(String userEmail, Long invitationId) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        TeamInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));

        if (!invitation.getCompany().getId().equals(user.getCompany().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        invitation.setActive(false);
        invitationRepository.save(invitation);
    }
}
