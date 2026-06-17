package com.escala.authservice.adapter.auth.persistence;

import com.escala.authservice.core.auth.domain.UserDomain;
import com.escala.authservice.core.auth.port.out.UserPersistencePort;
import com.escala.authservice.entity.Role;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class UserPersistenceAdapter implements UserPersistencePort {
    private final UserRepository repository;

    @Override
    public Optional<UserDomain> findByEmailAndCompanySlug(String email, String companySlug) {
        return repository.findByEmailAndCompanySlug(email, companySlug)
                .map(this::toDomain);
    }

    @Override
    public UserDomain save(UserDomain userDomain) {
        // Here we would handle converting domain back to entity, 
        // including fetching the Company entity from the ID.
        // For brevity in this refactor, I'll focus on the retrieval first.
        throw new UnsupportedOperationException("Implement set/save flow when needed in hexagonal context");
    }

    private UserDomain toDomain(User entity) {
        return UserDomain.builder()
                .id(entity.getId())
                .username(entity.getUsername())
                .email(entity.getEmail())
                .password(entity.getPassword())
                .active(entity.isActive())
                .roles(entity.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .companyId(entity.getCompany() != null ? entity.getCompany().getId() : null)
                .companySlug(entity.getCompany() != null ? entity.getCompany().getSlug() : null)
                .build();
    }
}
