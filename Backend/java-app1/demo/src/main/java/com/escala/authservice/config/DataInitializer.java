package com.escala.authservice.config;

import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.Employee;
import com.escala.authservice.entity.Role;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.CompanyRepository;
import com.escala.authservice.repository.EmployeeRepository;
import com.escala.authservice.repository.RoleRepository;
import com.escala.authservice.repository.UserRepository;
import com.escala.authservice.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {
    private final RoleRepository roleRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedDevelopmentData() {
        return args -> {
            for (String roleName : List.of("ADMIN", "MANAGER", "USER", "OWNER", "LEAD")) {
                roleRepository.findByName(roleName)
                        .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));
            }

            Company company = companyRepository.findBySlug(CompanyService.DEFAULT_COMPANY_SLUG)
                    .orElseGet(() -> companyRepository.save(Company.builder()
                            .name("Escala Demo")
                            .slug(CompanyService.DEFAULT_COMPANY_SLUG)
                            .theme("system")
                            .active(true)
                            .build()));

            Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
            Role userRole = roleRepository.findByName("USER").orElseThrow();

            User admin = userRepository.findByEmail("admin@escala.local")
                    .orElseGet(() -> userRepository.save(User.builder()
                            .username("admin")
                            .email("admin@escala.local")
                            .password(passwordEncoder.encode("Admin@123456"))
                            .roles(Set.of(adminRole))
                            .theme("system")
                            .active(true)
                            .company(company)
                            .build()));
            if (admin.getCompany() == null) {
                admin.setCompany(company);
                userRepository.save(admin);
            }

            User employeeUser = userRepository.findByEmail("funcionario@escala.local")
                    .orElseGet(() -> userRepository.save(User.builder()
                            .username("funcionario")
                            .email("funcionario@escala.local")
                            .password(passwordEncoder.encode("User@123456"))
                            .roles(Set.of(userRole))
                            .theme("system")
                            .active(true)
                            .company(company)
                            .build()));
            if (employeeUser.getCompany() == null) {
                employeeUser.setCompany(company);
                userRepository.save(employeeUser);
            }

            employeeRepository.findByEmail("funcionario@escala.local")
                    .orElseGet(() -> employeeRepository.save(Employee.builder()
                            .fullName("Funcionario Demo")
                            .email("funcionario@escala.local")
                            .active(true)
                            .user(employeeUser)
                            .company(company)
                            .build()));
        };
    }
}
