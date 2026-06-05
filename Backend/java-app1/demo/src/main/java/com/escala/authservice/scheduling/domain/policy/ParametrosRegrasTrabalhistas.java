package com.escala.authservice.scheduling.domain.policy;

import java.time.Duration;

public record ParametrosRegrasTrabalhistas(
        Duration jornadaDiariaPadrao,
        Duration maximoHorasExtrasDiarias,
        Duration jornadaSemanalMaxima,
        Duration jornadaMensalReferencia,
        Duration intervaloIntrajornadaMinimoAcimaSeisHoras,
        Duration intervaloIntrajornadaMaximoAcimaSeisHoras,
        Duration intervaloIntrajornadaMinimoEntreQuatroESeisHoras,
        Duration intervaloInterjornadaMinimo,
        Duration descansoSemanalMinimo,
        int quantidadeFuncionariosParaPontoObrigatorio,
        boolean permitePontoVoluntario,
        boolean permiteEscalaDozePorTrintaESeis
) {
    public ParametrosRegrasTrabalhistas(
            Duration jornadaDiariaPadrao,
            Duration maximoHorasExtrasDiarias,
            Duration intervaloInterjornadaMinimo,
            Duration descansoSemanalMinimo,
            boolean permiteEscalaDozePorTrintaESeis
    ) {
        this(
                jornadaDiariaPadrao,
                maximoHorasExtrasDiarias,
                Duration.ofHours(44),
                Duration.ofHours(220),
                Duration.ofHours(1),
                Duration.ofHours(2),
                Duration.ofMinutes(15),
                intervaloInterjornadaMinimo,
                descansoSemanalMinimo,
                20,
                true,
                permiteEscalaDozePorTrintaESeis
        );
    }

    public static ParametrosRegrasTrabalhistas padraoBrasil() {
        return new ParametrosRegrasTrabalhistas(
                Duration.ofHours(8),
                Duration.ofHours(2),
                Duration.ofHours(44),
                Duration.ofHours(220),
                Duration.ofHours(1),
                Duration.ofHours(2),
                Duration.ofMinutes(15),
                Duration.ofHours(11),
                Duration.ofHours(24),
                20,
                true,
                false
        );
    }

    public Duration jornadaDiariaMaximaComHoraExtra() {
        return jornadaDiariaPadrao.plus(maximoHorasExtrasDiarias);
    }

    public boolean exigeControlePonto(int quantidadeFuncionarios) {
        return quantidadeFuncionarios > quantidadeFuncionariosParaPontoObrigatorio;
    }
}
