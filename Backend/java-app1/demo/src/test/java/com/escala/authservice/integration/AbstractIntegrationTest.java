package com.escala.authservice.integration;

import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.Employee;
import com.escala.authservice.entity.Role;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.CompanyRepository;
import com.escala.authservice.repository.EmployeeRepository;
import com.escala.authservice.repository.RoleRepository;
import com.escala.authservice.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = false)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
abstract class AbstractIntegrationTest {

    protected record TenantFixture(Company company, User owner, Employee employee) {
    }

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("escala_test")
            .withUsername("escala")
            .withPassword("escala");

    @Container
    static final GenericContainer<?> REDIS = new GenericContainer<>(DockerImageName.parse("redis:7.4-alpine"))
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("spring.data.redis.host", REDIS::getHost);
        registry.add("spring.data.redis.port", () -> REDIS.getMappedPort(6379));
    }

    @Autowired
    protected JdbcTemplate jdbcTemplate;

    @Autowired
    protected StringRedisTemplate stringRedisTemplate;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    @Autowired
    protected CompanyRepository companyRepository;

    @Autowired
    protected RoleRepository roleRepository;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected EmployeeRepository employeeRepository;

    @BeforeEach
    void resetState() {
        SecurityContextHolder.clearContext();
        flushRedis();
        jdbcTemplate.execute("""
                TRUNCATE TABLE
                  schedule_validation_acknowledgements,
                  schedule_cycle_assignments,
                  schedule_holidays,
                  schedule_cycles,
                  team_invitations,
                  password_reset_tokens,
                  employees,
                  user_roles,
                  users,
                  roles,
                  companies
                RESTART IDENTITY CASCADE
                """);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    protected TenantFixture persistTenantFixture(String key) {
        Company company = persistCompany(key);
        User owner = persistUser(company, "owner@" + key + ".test", "owner-" + key, "OWNER");
        Employee employee = persistEmployee(
                company,
                owner,
                "employee@" + key + ".test",
                "Funcionario " + key
        );
        return new TenantFixture(company, owner, employee);
    }

    protected void authenticateAs(TenantFixture fixture, String... roleNames) {
        Set<String> roles = Arrays.stream(roleNames).collect(Collectors.toSet());
        var principal = new com.escala.authservice.security.AuthenticatedUserPrincipal(
                fixture.owner().getId(),
                fixture.owner().getEmail(),
                fixture.company().getId(),
                fixture.company().getSlug(),
                roles
        );
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, Set.of())
        );
    }

    protected Company persistCompany(String slug) {
        return companyRepository.saveAndFlush(Company.builder()
                .name("Empresa " + slug)
                .slug(slug)
                .active(true)
                .theme("system")
                .planType("FREE")
                .build());
    }

    protected Role persistRole(String name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.saveAndFlush(Role.builder().name(name).build()));
    }

    protected User persistUser(Company company, String email, String username, String... roleNames) {
        Set<Role> roles = Arrays.stream(roleNames)
                .map(this::persistRole)
                .collect(Collectors.toSet());

        return userRepository.saveAndFlush(User.builder()
                .company(company)
                .email(email.toLowerCase(Locale.ROOT))
                .username(username)
                .password(passwordEncoder.encode("Senha@123"))
                .roles(roles)
                .theme("system")
                .active(true)
                .build());
    }

    protected Employee persistEmployee(Company company, User user, String email, String fullName) {
        return employeeRepository.saveAndFlush(Employee.builder()
                .company(company)
                .user(user)
                .email(email.toLowerCase(Locale.ROOT))
                .fullName(fullName)
                .active(true)
                .build());
    }

    private void flushRedis() {
        RedisConnectionFactory connectionFactory = stringRedisTemplate.getConnectionFactory();
        if (connectionFactory == null) {
            return;
        }
        try (var connection = connectionFactory.getConnection()) {
            connection.serverCommands().flushAll();
        }
    }
}
