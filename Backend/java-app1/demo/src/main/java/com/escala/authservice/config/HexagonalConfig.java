package com.escala.authservice.config;

import com.escala.authservice.core.common.port.out.EmployeeOutputPort;
import com.escala.authservice.core.contact.port.ContactOutputPort;
import com.escala.authservice.core.contact.usecase.SubmitContactUseCase;
import com.escala.authservice.core.scheduling.application.GenerateScheduleService;
import com.escala.authservice.core.scheduling.port.out.WorkShiftOutputPort;
import com.escala.authservice.core.learning.application.LearningProgressService;
import com.escala.authservice.core.learning.port.out.LearningProgressOutputPort;
import com.escala.authservice.core.auth.application.AuthenticationUseCaseImpl;
import com.escala.authservice.core.auth.port.in.AuthenticationUseCase;
import com.escala.authservice.core.auth.port.out.UserPersistencePort;
import com.escala.authservice.core.company.application.CompanyUseCaseImpl;
import com.escala.authservice.core.company.port.in.CompanyUseCase;
import com.escala.authservice.core.company.port.out.CompanyPersistencePort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class HexagonalConfig {
    
    @Bean
    public CompanyUseCase companyUseCase(CompanyPersistencePort companyPersistencePort) {
        return new CompanyUseCaseImpl(companyPersistencePort);
    }

    @Bean
    public AuthenticationUseCase authenticationUseCase(
            UserPersistencePort userPersistencePort,
            PasswordEncoder passwordEncoder
    ) {
        return new AuthenticationUseCaseImpl(userPersistencePort, passwordEncoder::matches);
    }

    @Bean
    public LearningProgressService learningProgressService(LearningProgressOutputPort outputPort) {
        return new LearningProgressService(outputPort);
    }

    @Bean
    public SubmitContactUseCase submitContactUseCase(ContactOutputPort contactOutputPort) {
        return new SubmitContactUseCase(contactOutputPort);
    }

    @Bean
    public GenerateScheduleService generateScheduleService(
            WorkShiftOutputPort workShiftOutputPort,
            EmployeeOutputPort employeeOutputPort
    ) {
        return new GenerateScheduleService(workShiftOutputPort, employeeOutputPort);
    }
}
