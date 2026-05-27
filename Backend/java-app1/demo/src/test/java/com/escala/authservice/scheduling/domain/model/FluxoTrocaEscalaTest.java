package com.escala.authservice.scheduling.domain.model;

import com.escala.authservice.scheduling.domain.enums.StatusTroca;
import com.escala.authservice.scheduling.domain.exception.TrocaInvalidaException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class FluxoTrocaEscalaTest {
    @Test
    void permiteAprovacaoDoColegaAntesDoGestor() {
        FluxoTrocaEscala fluxo = new FluxoTrocaEscala(StatusTroca.SOLICITADO);

        assertEquals(StatusTroca.APROVADO_PELO_COLEGA, fluxo.aprovarPeloColega());
        assertEquals(StatusTroca.APROVADO_PELO_GESTOR, fluxo.decidirPeloGestor(true));
        assertEquals(StatusTroca.EFETIVADO, fluxo.efetivar());
    }

    @Test
    void rejeitaEfetivacaoSemAprovacaoDoGestor() {
        FluxoTrocaEscala fluxo = new FluxoTrocaEscala(StatusTroca.APROVADO_PELO_COLEGA);

        assertThrows(TrocaInvalidaException.class, fluxo::efetivar);
    }

    @Test
    void permiteRejeicaoAntesDaEfetivacao() {
        FluxoTrocaEscala fluxo = new FluxoTrocaEscala(StatusTroca.EM_ANALISE);

        assertEquals(StatusTroca.REJEITADO, fluxo.decidirPeloGestor(false));
    }
}
