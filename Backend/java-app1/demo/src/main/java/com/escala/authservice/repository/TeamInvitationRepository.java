package com.escala.authservice.repository;

import com.escala.authservice.entity.TeamInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, Long> {
    Optional<TeamInvitation> findByToken(String token);
    List<TeamInvitation> findByCompanyId(Long companyId);
    Optional<TeamInvitation> findByEmailAndCompanyId(String email, Long companyId);
}
