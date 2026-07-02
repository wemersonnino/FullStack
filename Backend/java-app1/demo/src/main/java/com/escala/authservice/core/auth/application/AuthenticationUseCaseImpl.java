package com.escala.authservice.core.auth.application;

import com.escala.authservice.core.auth.domain.UserDomain;
import com.escala.authservice.core.auth.port.in.AuthenticationUseCase;
import com.escala.authservice.core.auth.port.out.UserPersistencePort;
import lombok.RequiredArgsConstructor;

import java.util.function.BiFunction;

@RequiredArgsConstructor
public class AuthenticationUseCaseImpl implements AuthenticationUseCase {
    private final UserPersistencePort userPersistencePort;
    private final BiFunction<String, String, Boolean> passwordEncoder;

    @Override
    public UserDomain authenticate(String email, String companySlug, String password) {
        String normalizedEmail = email != null ? email.trim().toLowerCase(java.util.Locale.ROOT) : "";
        String normalizedSlug = companySlug != null ? companySlug.trim().toLowerCase(java.util.Locale.ROOT) : "";

        UserDomain user = userPersistencePort.findByEmailAndCompanySlug(normalizedEmail, normalizedSlug)
                .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas"));

        if (!user.isActive() || !passwordEncoder.apply(password, user.getPassword())) {
            throw new IllegalArgumentException("Credenciais inválidas");
        }

        return user;
    }
}
