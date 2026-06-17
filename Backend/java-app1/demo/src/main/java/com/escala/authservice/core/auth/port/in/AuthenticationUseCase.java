package com.escala.authservice.core.auth.port.in;

import com.escala.authservice.core.auth.domain.UserDomain;

public interface AuthenticationUseCase {
    UserDomain authenticate(String email, String companySlug, String password);
}
