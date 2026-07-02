package com.escala.authservice.integration;

import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TenantUniquenessIntegrationTest extends AbstractIntegrationTest {

    @Test
    void allowsSameEmailAcrossDifferentTenantsForUsersAndEmployees() {
        Company companyA = persistCompany("empresa-a");
        Company companyB = persistCompany("empresa-b");

        User userA = persistUser(companyA, "shared@example.com", "shared-a", "OWNER");
        User userB = persistUser(companyB, "SHARED@example.com", "shared-b", "OWNER");

        persistEmployee(companyA, userA, "shared@example.com", "Colaborador A");
        persistEmployee(companyB, userB, "SHARED@example.com", "Colaborador B");

        assertThat(userRepository.findAllByEmailIgnoreCase("shared@example.com")).hasSize(2);
        assertThat(employeeRepository.findAllByEmailIgnoreCase("shared@example.com")).hasSize(2);
    }

    @Test
    void rejectsSameEmailInsideTheSameTenantIgnoringCase() {
        Company company = persistCompany("empresa-a");
        persistUser(company, "duplicado@example.com", "owner-a", "OWNER");

        assertThatThrownBy(() -> userRepository.saveAndFlush(User.builder()
                .company(company)
                .email("DUPLICADO@example.com")
                .username("owner-b")
                .password(passwordEncoder.encode("Senha@123"))
                .roles(Set.of(persistRole("ADMIN")))
                .theme("system")
                .active(true)
                .build()))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsSameEmployeeEmailInsideTheSameTenantIgnoringCase() {
        Company company = persistCompany("empresa-a");
        User userA = persistUser(company, "employee-owner@example.com", "owner-a", "OWNER");
        User userB = persistUser(company, "employee-owner-2@example.com", "owner-b", "ADMIN");

        persistEmployee(company, userA, "funcionario@example.com", "Funcionario A");

        assertThatThrownBy(() -> persistEmployee(company, userB, "FUNCIONARIO@example.com", "Funcionario B"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
