package com.escala.authservice.repository;

import com.escala.authservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findAllByEmailIgnoreCase(String email);
    Optional<User> findByEmailAndCompanySlug(String email, String companySlug);
    List<User> findByCompanyId(UUID companyId);
    org.springframework.data.domain.Page<User> findByCompanyId(UUID companyId, org.springframework.data.domain.Pageable pageable);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, UUID id);
    boolean existsByCompanyIdAndEmailIgnoreCase(UUID companyId, String email);
    boolean existsByCompanyIdAndEmailIgnoreCaseAndIdNot(UUID companyId, String email, UUID id);
    boolean existsByCompanyIdAndUsernameIgnoreCase(UUID companyId, String username);
    boolean existsByCompanyIdAndUsernameIgnoreCaseAndIdNot(UUID companyId, String username, UUID id);
}
