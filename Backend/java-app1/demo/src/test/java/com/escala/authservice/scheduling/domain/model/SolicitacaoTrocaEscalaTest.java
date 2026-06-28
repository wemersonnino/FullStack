package com.escala.authservice.scheduling.domain.model;

import com.escala.authservice.scheduling.domain.exception.TrocaInvalidaException;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SolicitacaoTrocaEscalaTest {
    private final LocalDate hoje = LocalDate.of(2026, 5, 26);

    @Test
    void aceitaSolicitacaoValidaComCompensacaoFutura() {
        SolicitacaoTrocaEscala solicitacao = new SolicitacaoTrocaEscala(
                new UUID(0L, 1L),
                new UUID(0L, 1L),
                hoje.plusDays(2),
                hoje.plusDays(5)
        );

        assertDoesNotThrow(() -> solicitacao.validarSolicitacao(hoje));
    }

    @Test
    void rejeitaEscalaDeOutroFuncionario() {
        SolicitacaoTrocaEscala solicitacao = new SolicitacaoTrocaEscala(
                new UUID(0L, 1L),
                new UUID(0L, 2L),
                hoje.plusDays(2),
                hoje.plusDays(5)
        );

        assertThrows(TrocaInvalidaException.class, () -> solicitacao.validarSolicitacao(hoje));
    }

    @Test
    void rejeitaEscalaPassada() {
        SolicitacaoTrocaEscala solicitacao = new SolicitacaoTrocaEscala(
                new UUID(0L, 1L),
                new UUID(0L, 1L),
                hoje.minusDays(1),
                hoje.plusDays(5)
        );

        assertThrows(TrocaInvalidaException.class, () -> solicitacao.validarSolicitacao(hoje));
    }

    @Test
    void rejeitaCompensacaoNaMesmaDataDaEscalaOriginal() {
        LocalDate dataEscala = hoje.plusDays(2);
        SolicitacaoTrocaEscala solicitacao = new SolicitacaoTrocaEscala(
                new UUID(0L, 1L),
                new UUID(0L, 1L),
                dataEscala,
                dataEscala
        );

        assertThrows(TrocaInvalidaException.class, () -> solicitacao.validarSolicitacao(hoje));
    }
}
