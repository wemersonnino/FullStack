package com.escala.authservice.repository;

import com.escala.authservice.entity.TeamInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, UUID> {
    Optional<TeamInvitation> findByToken(String token);
    List<TeamInvitation> findByCompanyId(UUID companyId);
    Optional<TeamInvitation> findByEmailAndCompanyId(String email, UUID companyId);
    List<TeamInvitation> findAllByEmailIgnoreCaseAndCompanyId(String email, UUID companyId);
    List<TeamInvitation> findByEmailIgnoreCaseAndActiveTrue(String email);
}
