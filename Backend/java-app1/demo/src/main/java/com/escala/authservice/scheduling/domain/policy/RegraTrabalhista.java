package com.escala.authservice.scheduling.domain.policy;

import java.util.List;
import java.util.Optional;

public interface RegraTrabalhista {
    Optional<String> validar(
            JornadaPlanejada jornada,
            List<JornadaPlanejada> jornadasRelacionadas,
            ParametrosRegrasTrabalhistas parametros
    );
}
