package com.escala.authservice.repository;

import com.escala.authservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndCompanySlug(String email, String companySlug);
    List<User> findByCompanyId(Long companyId);
}
