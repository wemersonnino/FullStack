package com.escala.authservice.core.auth.port.out;

import com.escala.authservice.core.auth.domain.UserDomain;
import java.util.Optional;

public interface UserPersistencePort {
    Optional<UserDomain> findByEmailAndCompanySlug(String email, String companySlug);
    UserDomain save(UserDomain user);
}
