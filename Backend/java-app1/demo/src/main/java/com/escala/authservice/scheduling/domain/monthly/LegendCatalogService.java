package com.escala.authservice.scheduling.domain.monthly;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Service
public class LegendCatalogService {
    private static final List<LegendCode> DEFAULT_LEGENDS = List.of(
            new LegendCode("T", "Trabalho", LegendImpact.WORKED, Duration.ofHours(8)),
            new LegendCode("F", "Folga", LegendImpact.REST, Duration.ZERO),
            new LegendCode("D", "Descanso", LegendImpact.REST, Duration.ZERO),
            new LegendCode("FE", "Ferias", LegendImpact.ABSENCE, Duration.ZERO),
            new LegendCode("AT", "Atestado", LegendImpact.ABSENCE, Duration.ZERO),
            new LegendCode("FA", "Falta", LegendImpact.ABSENCE, Duration.ZERO),
            new LegendCode("TR", "Treinamento", LegendImpact.NEUTRAL, Duration.ZERO),
            new LegendCode("CU", "Curso", LegendImpact.NEUTRAL, Duration.ZERO),
            new LegendCode("OT", "Outros trabalhados", LegendImpact.WORKED, Duration.ofHours(8)),
            new LegendCode("OA", "Outros ausentes", LegendImpact.ABSENCE, Duration.ZERO)
    );

    public List<LegendCode> listDefaultLegends() {
        return DEFAULT_LEGENDS;
    }
}
