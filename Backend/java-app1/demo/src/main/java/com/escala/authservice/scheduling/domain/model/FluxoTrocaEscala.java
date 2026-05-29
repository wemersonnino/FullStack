package com.escala.authservice.scheduling.domain.model;

import com.escala.authservice.scheduling.domain.enums.StatusTroca;
import com.escala.authservice.scheduling.domain.exception.TrocaInvalidaException;

public class FluxoTrocaEscala {
    private StatusTroca status;

    public FluxoTrocaEscala(StatusTroca status) {
        this.status = status == null ? StatusTroca.SOLICITADO : status;
    }

    public StatusTroca aprovarPeloColega() {
        if (status != StatusTroca.SOLICITADO && status != StatusTroca.EM_ANALISE) {
            throw new TrocaInvalidaException("A troca nao esta aguardando aceite do colega");
        }
        status = StatusTroca.APROVADO_PELO_COLEGA;
        return status;
    }

    public StatusTroca decidirPeloGestor(boolean aprovado) {
        if (!aprovado) {
            if (status == StatusTroca.EFETIVADO || status == StatusTroca.CANCELADO) {
                throw new TrocaInvalidaException("A troca nao pode mais ser rejeitada");
            }
            status = StatusTroca.REJEITADO;
            return status;
        }

        if (status != StatusTroca.SOLICITADO && status != StatusTroca.APROVADO_PELO_COLEGA) {
            throw new TrocaInvalidaException("A troca nao esta apta para aprovacao do gestor");
        }
        status = StatusTroca.APROVADO_PELO_GESTOR;
        return status;
    }

    public StatusTroca efetivar() {
        if (status != StatusTroca.APROVADO_PELO_GESTOR) {
            throw new TrocaInvalidaException("Somente trocas aprovadas pelo gestor podem ser efetivadas");
        }
        status = StatusTroca.EFETIVADO;
        return status;
    }

    public StatusTroca status() {
        return status;
    }
}
