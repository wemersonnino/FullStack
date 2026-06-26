package com.escala.authservice.scheduling.domain.monthly;

import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.Map;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LegendCatalogServiceTest {
    private final LegendCatalogService service = new LegendCatalogService();

    @Test
    void listaLegendasPadraoDaFundacaoMensal() {
        Map<String, LegendCode> legends = service.listDefaultLegends().stream()
                .collect(Collectors.toMap(LegendCode::code, legend -> legend));

        assertEquals(10, legends.size());
        assertEquals(LegendImpact.WORKED, legends.get("T").impact());
        assertEquals(Duration.ofHours(8), legends.get("T").plannedHours());
        assertEquals(LegendImpact.REST, legends.get("F").impact());
        assertEquals(LegendImpact.ABSENCE, legends.get("FE").impact());
        assertEquals(LegendImpact.NEUTRAL, legends.get("TR").impact());
        assertTrue(legends.containsKey("OT"));
        assertTrue(legends.containsKey("OA"));
    }
}
