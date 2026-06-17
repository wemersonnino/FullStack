package com.escala.authservice.core.auth.port.out;

import com.escala.authservice.entity.User;
import java.util.Optional;

public interface AuthUserOutputPort {
    Optional<User> findByEmailAndCompanySlug(String email, String companySlug);
    User save(User user);
    boolean existsByUsername(String username);
}
