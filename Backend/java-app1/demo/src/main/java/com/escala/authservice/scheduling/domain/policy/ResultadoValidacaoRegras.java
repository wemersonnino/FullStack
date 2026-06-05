package com.escala.authservice.scheduling.domain.policy;

import java.util.List;

public record ResultadoValidacaoRegras(List<String> violacoes) {
    public boolean aprovado() {
        return violacoes.isEmpty();
    }

    public void exigirAprovacao() {
        if (!aprovado()) {
            throw new IllegalStateException(String.join("; ", violacoes));
        }
    }
}
