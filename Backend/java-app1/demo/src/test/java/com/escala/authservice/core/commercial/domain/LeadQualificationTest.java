package com.escala.authservice.core.commercial.domain;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LeadQualificationTest {

    @Test
    void personalEmailRequiresQualification() {
        LeadQualification qualification = LeadQualification.of("gestor@gmail.com", "varejo", "11-50");

        assertTrue(qualification.personalEmail());
        assertEquals("NEEDS_QUALIFICATION", qualification.leadStatus());
        assertEquals("6x1", qualification.recommendedTemplate());
        assertEquals("essencial", qualification.recommendedPlan());
    }

    @Test
    void criticalOperationGetsCriticalPlanAndTwelveByThirtySixTemplate() {
        LeadQualification qualification = LeadQualification.of("ops@empresa.com", "seguranca", "201-500");

        assertFalse(qualification.personalEmail());
        assertEquals("SALES_QUALIFIED", qualification.leadStatus());
        assertEquals("operacao-critica", qualification.recommendedPlan());
        assertEquals("12x36", qualification.recommendedTemplate());
    }

    @Test
    void midMarketHealthcareGetsProfessionalPlan() {
        LeadQualification qualification = LeadQualification.of("rh@clinica.com", "clinicas-saude", "51-100");

        assertFalse(qualification.personalEmail());
        assertEquals("WARM", qualification.leadStatus());
        assertEquals("profissional", qualification.recommendedPlan());
        assertEquals("12x36", qualification.recommendedTemplate());
    }
}
