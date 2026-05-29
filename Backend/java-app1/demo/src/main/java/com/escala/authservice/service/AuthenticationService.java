package com.escala.authservice.service;

import com.escala.authservice.dto.AuthenticationResponse;
import com.escala.authservice.dto.*;
import com.escala.authservice.entity.*;
import com.escala.authservice.repository.PasswordResetTokenRepository;
import com.escala.authservice.repository.RoleRepository;
import com.escala.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository repository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CompanyService companyService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RecaptchaService recaptchaService;
    private final GoogleIdentityService googleIdentityService;

    public AuthenticationResponse register(RegisterRequest request) {
        recaptchaService.verifyIfProduction(request.getRecaptchaToken());
        
        // Se companyName for fornecido, cria uma nova empresa (Fluxo SaaS Self-Service)
        // Caso contrário, tenta resolver pelo slug (Fluxo de Convite/Empresa Existente)
        Company company;
        if (request.getCompanyName() != null && !request.getCompanyName().isBlank()) {
            company = companyService.create(com.escala.authservice.dto.CompanyRequest.builder()
                    .name(request.getCompanyName())
                    .active(true)
                    .build());
        } else {
            company = companyService.resolve(request.getCompanySlug());
        }

        repository.findByEmailAndCompanySlug(request.getEmail(), company.getSlug())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Email ja cadastrado para esta empresa");
                });
        
        // Se criou uma empresa, o primeiro usuário é OWNER, senão é USER
        String roleName = (request.getCompanyName() != null && !request.getCompanyName().isBlank()) ? "OWNER" : "USER";
        Role userRole = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));

        var user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of(userRole))
                .theme("system")
                .active(true)
                .company(company)
                .build();
        repository.save(user);

        var userDetails = userDetails(user);
        var jwtToken = jwtService.generateToken(jwtClaims(user), userDetails);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .user(toUserDto(user))
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        recaptchaService.verifyIfProduction(request.getRecaptchaToken());
        Company company = companyService.resolve(request.getCompanySlug());
        var user = repository.findByEmailAndCompanySlug(request.getEmail(), company.getSlug())
                .orElseThrow();

        if (!user.isActive() || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Credenciais invalidas");
        }

        var userDetails = userDetails(user);
        var jwtToken = jwtService.generateToken(jwtClaims(user), userDetails);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .user(toUserDto(user))
                .build();
    }

    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        recaptchaService.verifyIfProduction(request.getRecaptchaToken());
        Company company = companyService.resolve(request.getCompanySlug());
        User user = repository.findByEmailAndCompanySlug(request.getEmail(), company.getSlug())
                .orElse(null);

        if (user == null) {
            return ForgotPasswordResponse.builder()
                    .message("Se o email existir, enviaremos instrucoes de recuperacao.")
                    .build();
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.save(PasswordResetToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiresAt(OffsetDateTime.now().plusMinutes(30))
                .build());

        return ForgotPasswordResponse.builder()
                .message("Token de recuperacao gerado.")
                .resetToken(resetToken.getToken())
                .resetUrl("/reset-password?code=" + resetToken.getToken())
                .build();
    }

    @Transactional
    public AuthenticationResponse resetPassword(ResetPasswordRequest request) {
        recaptchaService.verifyIfProduction(request.getRecaptchaToken());
        if (request.getPassword() == null || !request.getPassword().equals(request.getPasswordConfirmation())) {
            throw new IllegalArgumentException("Confirmacao de senha invalida");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getCode())
                .filter(PasswordResetToken::isUsable)
                .orElseThrow(() -> new IllegalArgumentException("Token de recuperacao invalido ou expirado"));

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        repository.save(user);

        resetToken.setUsedAt(OffsetDateTime.now());
        passwordResetTokenRepository.save(resetToken);

        var userDetails = userDetails(user);
        var jwtToken = jwtService.generateToken(jwtClaims(user), userDetails);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .user(toUserDto(user))
                .build();
    }

    @Transactional
    public AuthenticationResponse authenticateGoogle(GoogleLoginRequest request) {
        recaptchaService.verifyIfProduction(request.getRecaptchaToken());
        Company company = companyService.resolve(request.getCompanySlug());
        GoogleIdentityService.GoogleProfile profile = googleIdentityService.verify(request.getIdToken());
        Role userRole = roleRepository.findByName("USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("USER").build()));

        User user = repository.findByEmailAndCompanySlug(profile.email(), company.getSlug())
                .orElseGet(() -> repository.save(User.builder()
                        .username(uniqueUsername(profile.email()))
                        .email(profile.email())
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .roles(Set.of(userRole))
                        .theme(company.getTheme() == null ? "system" : company.getTheme())
                        .active(true)
                        .company(company)
                        .build()));

        if (!user.isActive()) {
            throw new IllegalArgumentException("Usuario inativo");
        }

        var jwtToken = jwtService.generateToken(jwtClaims(user), userDetails(user));
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .user(toUserDto(user))
                .build();
    }

    private java.util.Map<String, Object> jwtClaims(User user) {
        Company company = user.getCompany();
        return Map.of(
                "id", user.getId(),
                "roles", user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()),
                "theme", user.getTheme() == null ? "system" : user.getTheme(),
                "companyId", company == null ? "" : company.getId(),
                "companySlug", company == null ? "" : company.getSlug()
        );
    }

    private org.springframework.security.core.userdetails.UserDetails userDetails(User user) {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRoles().stream().map(Role::getName).toArray(String[]::new))
                .build();
    }

    private AuthenticationResponse.UserDto toUserDto(User user) {
        Company company = user.getCompany();
        return AuthenticationResponse.UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .theme(user.getTheme() == null ? "system" : user.getTheme())
                .avatarUrl(user.getAvatarUrl())
                .address(user.getAddress())
                .cep(user.getCep())
                .street(user.getStreet())
                .number(user.getNumber())
                .complement(user.getComplement())
                .neighborhood(user.getNeighborhood())
                .city(user.getCity())
                .state(user.getState())
                .position(user.getPosition())
                .function(user.getFunction())
                .companyId(company == null ? null : company.getId())
                .companySlug(company == null ? null : company.getSlug())
                .companyName(company == null ? null : company.getName())
                .companyTheme(company == null ? null : company.getTheme())
                .build();
    }

    private String uniqueUsername(String email) {
        String base = email.split("@")[0].replaceAll("[^A-Za-z0-9._-]", "").toLowerCase();
        if (base.isBlank()) {
            base = "user";
        }
        String candidate = base;
        if (repository.findByUsername(candidate).isEmpty()) {
            return candidate;
        }
        candidate = base + "-" + UUID.randomUUID().toString().substring(0, 8);
        return candidate;
    }
}
