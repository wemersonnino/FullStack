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
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {
    private final RoleRepository roleRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Bean
    CommandLineRunner seedDevelopmentData() {
        return args -> {
            createTriggers();

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

    private void createTriggers() {
        try {
            log.info("Inicializando a criação de Triggers de capacidade mínima no banco de dados...");
            
            // 1. Cria a função PL/pgSQL
            jdbcTemplate.execute("""
                CREATE OR REPLACE FUNCTION tg_validate_operational_capacity()
                RETURNS TRIGGER AS $$
                DECLARE
                    v_sector_id BIGINT;
                    v_shift_date DATE;
                    v_day_of_week INT;
                    v_start_time TIME;
                    v_end_time TIME;
                    v_min_required INT;
                    v_current_active INT;
                BEGIN
                    IF TG_OP = 'DELETE' THEN
                        SELECT sector_id INTO v_sector_id FROM employees WHERE id = OLD.employee_id;
                        v_shift_date := OLD.shift_date;
                        v_start_time := OLD.start_time;
                        v_end_time := OLD.end_time;
                    ELSE
                        SELECT sector_id INTO v_sector_id FROM employees WHERE id = NEW.employee_id;
                        v_shift_date := NEW.shift_date;
                        v_start_time := NEW.start_time;
                        v_end_time := NEW.end_time;
                    END IF;

                    IF v_sector_id IS NULL THEN
                        IF TG_OP = 'DELETE' THEN
                            RETURN OLD;
                        END IF;
                        RETURN NEW;
                    END IF;

                    v_day_of_week := EXTRACT(ISODOW FROM v_shift_date);

                    SELECT min_employees_required INTO v_min_required
                    FROM operational_capacities
                    WHERE target_id = v_sector_id 
                      AND target_type = 'SECTOR'
                      AND day_of_week = v_day_of_week
                      AND start_time <= v_start_time
                      AND end_time >= v_end_time;

                    IF v_min_required IS NULL THEN
                        IF TG_OP = 'DELETE' THEN
                            RETURN OLD;
                        END IF;
                        RETURN NEW;
                    END IF;

                    SELECT COUNT(*) INTO v_current_active
                    FROM work_shifts ws
                    JOIN employees e ON ws.employee_id = e.id
                    WHERE e.sector_id = v_sector_id
                      AND ws.shift_date = v_shift_date
                      AND ws.status = 'SCHEDULED'
                      AND (TG_OP = 'INSERT' OR ws.id <> OLD.id);

                    IF v_current_active < v_min_required THEN
                        RAISE EXCEPTION 'Operacao negada: A capacidade minima operacional do setor % para o dia % exige % colaboradores ativos (Atuais: %).', 
                            v_sector_id, v_shift_date, v_min_required, v_current_active;
                    END IF;

                    IF TG_OP = 'DELETE' THEN
                        RETURN OLD;
                    END IF;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
                """);

            // 2. Cria o gatilho (Trigger) na tabela work_shifts
            jdbcTemplate.execute("DROP TRIGGER IF EXISTS trg_check_operational_capacity ON work_shifts;");
            jdbcTemplate.execute("""
                CREATE TRIGGER trg_check_operational_capacity
                BEFORE UPDATE OR DELETE ON work_shifts
                FOR EACH ROW
                EXECUTE FUNCTION tg_validate_operational_capacity();
                """);

            log.info("Triggers de capacidade mínima operacional criados com sucesso.");
        } catch (Exception e) {
            log.warn("Nao foi possivel criar as triggers automáticas no banco (pode ocorrer se o banco nao for PostgreSQL): {}", e.getMessage());
        }
    }
}
