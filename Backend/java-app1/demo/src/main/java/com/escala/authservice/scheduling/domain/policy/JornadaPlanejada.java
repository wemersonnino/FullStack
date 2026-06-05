package com.escala.authservice.scheduling.domain.policy;

import com.escala.authservice.scheduling.domain.enums.PadraoEscala;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record JornadaPlanejada(
        Long funcionarioId,
        LocalDate data,
        LocalTime inicio,
        LocalTime fim,
        PadraoEscala padrao,
        Duration intervaloIntrajornada
) {
    public JornadaPlanejada(
            Long funcionarioId,
            LocalDate data,
            LocalTime inicio,
            LocalTime fim,
            PadraoEscala padrao
    ) {
        this(funcionarioId, data, inicio, fim, padrao, null);
    }

    public JornadaPlanejada {
        padrao = padrao == null ? PadraoEscala.COMUM : padrao;
    }

    public LocalDateTime inicioEmData() {
        return LocalDateTime.of(data, inicio);
    }

    public LocalDateTime fimEmData() {
        LocalDateTime fimNaData = LocalDateTime.of(data, fim);
        return fim.isAfter(inicio) ? fimNaData : fimNaData.plusDays(1);
    }

    public Duration duracao() {
        return Duration.between(inicioEmData(), fimEmData());
    }
}
