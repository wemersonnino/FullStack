package com.escala.authservice.scheduling.domain.model;

import com.escala.authservice.scheduling.domain.exception.TrocaInvalidaException;

import java.time.LocalDate;
import java.util.Objects;

public class SolicitacaoTrocaEscala {
    private final Long solicitanteId;
    private final Long donoEscalaId;
    private final LocalDate dataEscalaOriginal;
    private final LocalDate dataCompensacao;

    public SolicitacaoTrocaEscala(
            Long solicitanteId,
            Long donoEscalaId,
            LocalDate dataEscalaOriginal,
            LocalDate dataCompensacao
    ) {
        this.solicitanteId = solicitanteId;
        this.donoEscalaId = donoEscalaId;
        this.dataEscalaOriginal = dataEscalaOriginal;
        this.dataCompensacao = dataCompensacao;
    }

    public void validarSolicitacao(LocalDate hoje) {
        if (!Objects.equals(donoEscalaId, solicitanteId)) {
            throw new TrocaInvalidaException("A escala informada nao pertence ao solicitante");
        }

        if (dataEscalaOriginal == null) {
            throw new TrocaInvalidaException("A escala original e obrigatoria");
        }

        if (dataEscalaOriginal.isBefore(hoje)) {
            throw new TrocaInvalidaException("Nao e possivel solicitar troca de escala passada");
        }

        if (dataCompensacao == null) {
            return;
        }

        if (!dataCompensacao.isAfter(hoje)) {
            throw new TrocaInvalidaException("A data de compensacao deve ser futura");
        }

        if (dataCompensacao.equals(dataEscalaOriginal)) {
            throw new TrocaInvalidaException("A data de compensacao deve ser diferente da escala original");
        }
    }
}
