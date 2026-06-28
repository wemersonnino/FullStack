package com.escala.authservice.scheduling.domain.policy;

import com.escala.authservice.scheduling.domain.enums.PadraoEscala;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LaborRuleEngineTest {
    private final LaborRuleEngine engine = new LaborRuleEngine();
    private final LocalDate segunda = LocalDate.of(2026, 6, 1);

    @Test
    void aprovaJornadaComAteDuasHorasExtras() {
        JornadaPlanejada jornada = jornada(segunda, LocalTime.of(8, 0), LocalTime.of(18, 0));

        ResultadoValidacaoRegras resultado = engine.validar(jornada, List.of());

        assertTrue(resultado.aprovado());
    }

    @Test
    void rejeitaJornadaAcimaDoLimiteDiarioComHoraExtra() {
        JornadaPlanejada jornada = jornada(segunda, LocalTime.of(8, 0), LocalTime.of(19, 0));

        ResultadoValidacaoRegras resultado = engine.validar(jornada, List.of());

        assertFalse(resultado.aprovado());
    }

    @Test
    void rejeitaConflitoDeHorarioParaMesmoFuncionario() {
        JornadaPlanejada existente = jornada(segunda, LocalTime.of(8, 0), LocalTime.of(12, 0));
        JornadaPlanejada conflitante = jornada(segunda, LocalTime.of(11, 0), LocalTime.of(15, 0));

        ResultadoValidacaoRegras resultado = engine.validar(conflitante, List.of(existente));

        assertFalse(resultado.aprovado());
    }

    @Test
    void rejeitaJornadaSemanalAcimaDoLimiteConfigurado() {
        List<JornadaPlanejada> anteriores = List.of(
                jornada(segunda, LocalTime.of(8, 0), LocalTime.of(16, 0)),
                jornada(segunda.plusDays(1), LocalTime.of(8, 0), LocalTime.of(16, 0)),
                jornada(segunda.plusDays(2), LocalTime.of(8, 0), LocalTime.of(16, 0)),
                jornada(segunda.plusDays(3), LocalTime.of(8, 0), LocalTime.of(16, 0)),
                jornada(segunda.plusDays(4), LocalTime.of(8, 0), LocalTime.of(16, 0))
        );
        JornadaPlanejada sabado = jornada(segunda.plusDays(5), LocalTime.of(8, 0), LocalTime.of(13, 0));

        ResultadoValidacaoRegras resultado = engine.validar(sabado, anteriores);

        assertFalse(resultado.aprovado());
    }

    @Test
    void permiteParametrizarSemanaDeQuarentaHorasSemReescreverRegras() {
        ParametrosRegrasTrabalhistas parametros = new ParametrosRegrasTrabalhistas(
                Duration.ofHours(8),
                Duration.ofHours(2),
                Duration.ofHours(40),
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
        LaborRuleEngine engineConfigurado = new LaborRuleEngine(parametros);
        List<JornadaPlanejada> anteriores = List.of(
                jornada(segunda, LocalTime.of(8, 0), LocalTime.of(16, 0)),
                jornada(segunda.plusDays(1), LocalTime.of(8, 0), LocalTime.of(16, 0)),
                jornada(segunda.plusDays(2), LocalTime.of(8, 0), LocalTime.of(16, 0)),
                jornada(segunda.plusDays(3), LocalTime.of(8, 0), LocalTime.of(16, 0)),
                jornada(segunda.plusDays(4), LocalTime.of(8, 0), LocalTime.of(16, 0))
        );
        JornadaPlanejada sabado = jornada(segunda.plusDays(5), LocalTime.of(8, 0), LocalTime.of(9, 0));

        ResultadoValidacaoRegras resultado = engineConfigurado.validar(sabado, anteriores);

        assertFalse(resultado.aprovado());
    }

    @Test
    void rejeitaJornadaMensalAcimaDaReferenciaConfigurada() {
        ParametrosRegrasTrabalhistas parametros = new ParametrosRegrasTrabalhistas(
                Duration.ofHours(8),
                Duration.ofHours(2),
                Duration.ofHours(80),
                Duration.ofHours(16),
                Duration.ofHours(1),
                Duration.ofHours(2),
                Duration.ofMinutes(15),
                Duration.ofHours(11),
                Duration.ofHours(24),
                20,
                true,
                false
        );
        LaborRuleEngine engineConfigurado = new LaborRuleEngine(parametros);
        List<JornadaPlanejada> anteriores = List.of(
                jornada(segunda, LocalTime.of(8, 0), LocalTime.of(16, 0)),
                jornada(segunda.plusDays(1), LocalTime.of(8, 0), LocalTime.of(16, 0))
        );
        JornadaPlanejada terceiraJornada = jornada(segunda.plusDays(2), LocalTime.of(8, 0), LocalTime.of(9, 0));

        ResultadoValidacaoRegras resultado = engineConfigurado.validar(terceiraJornada, anteriores);

        assertFalse(resultado.aprovado());
    }

    @Test
    void rejeitaIntervaloIntrajornadaMenorQueMinimoParaJornadaAcimaDeSeisHoras() {
        JornadaPlanejada jornada = new JornadaPlanejada(
                new UUID(0L, 1L),
                segunda,
                LocalTime.of(8, 0),
                LocalTime.of(16, 0),
                PadraoEscala.COMUM,
                Duration.ofMinutes(30)
        );

        ResultadoValidacaoRegras resultado = engine.validar(jornada, List.of());

        assertFalse(resultado.aprovado());
    }

    @Test
    void rejeitaIntervaloIntrajornadaMaiorQueMaximoParaJornadaAcimaDeSeisHoras() {
        JornadaPlanejada jornada = new JornadaPlanejada(
                new UUID(0L, 1L),
                segunda,
                LocalTime.of(8, 0),
                LocalTime.of(16, 0),
                PadraoEscala.COMUM,
                Duration.ofHours(3)
        );

        ResultadoValidacaoRegras resultado = engine.validar(jornada, List.of());

        assertFalse(resultado.aprovado());
    }

    @Test
    void rejeitaIntervaloIntrajornadaMenorQueQuinzeMinutosParaJornadaEntreQuatroESeisHoras() {
        JornadaPlanejada jornada = new JornadaPlanejada(
                new UUID(0L, 1L),
                segunda,
                LocalTime.of(8, 0),
                LocalTime.of(13, 0),
                PadraoEscala.COMUM,
                Duration.ofMinutes(10)
        );

        ResultadoValidacaoRegras resultado = engine.validar(jornada, List.of());

        assertFalse(resultado.aprovado());
    }

    @Test
    void rejeitaIntervaloInterjornadaMenorQueOnzeHoras() {
        JornadaPlanejada anterior = jornada(segunda, LocalTime.of(14, 0), LocalTime.of(22, 0));
        JornadaPlanejada proxima = jornada(segunda.plusDays(1), LocalTime.of(8, 0), LocalTime.of(16, 0));

        ResultadoValidacaoRegras resultado = engine.validar(proxima, List.of(anterior));

        assertFalse(resultado.aprovado());
    }

    @Test
    void rejeitaSeteDiasConsecutivosSemDescansoSemanalMinimo() {
        List<JornadaPlanejada> anteriores = List.of(
                jornada(segunda, LocalTime.of(8, 0), LocalTime.of(17, 0)),
                jornada(segunda.plusDays(1), LocalTime.of(8, 0), LocalTime.of(17, 0)),
                jornada(segunda.plusDays(2), LocalTime.of(8, 0), LocalTime.of(17, 0)),
                jornada(segunda.plusDays(3), LocalTime.of(8, 0), LocalTime.of(17, 0)),
                jornada(segunda.plusDays(4), LocalTime.of(8, 0), LocalTime.of(17, 0)),
                jornada(segunda.plusDays(5), LocalTime.of(8, 0), LocalTime.of(17, 0))
        );
        JornadaPlanejada domingo = jornada(segunda.plusDays(6), LocalTime.of(8, 0), LocalTime.of(17, 0));

        ResultadoValidacaoRegras resultado = engine.validar(domingo, anteriores);

        assertFalse(resultado.aprovado());
    }

    @Test
    void rejeitaDozePorTrintaESeisSemConfiguracaoFormal() {
        JornadaPlanejada jornada = new JornadaPlanejada(
                new UUID(0L, 1L),
                segunda,
                LocalTime.of(7, 0),
                LocalTime.of(19, 0),
                PadraoEscala.DOZE_X_TRINTA_E_SEIS
        );

        ResultadoValidacaoRegras resultado = engine.validar(jornada, List.of());

        assertFalse(resultado.aprovado());
    }

    @Test
    void aprovaDozePorTrintaESeisQuandoConfiguradaFormalmente() {
        ParametrosRegrasTrabalhistas parametros = new ParametrosRegrasTrabalhistas(
                Duration.ofHours(8),
                Duration.ofHours(2),
                Duration.ofHours(11),
                Duration.ofHours(24),
                true
        );
        LaborRuleEngine engineConfigurado = new LaborRuleEngine(parametros);
        JornadaPlanejada jornada = new JornadaPlanejada(
                new UUID(0L, 1L),
                segunda,
                LocalTime.of(7, 0),
                LocalTime.of(19, 0),
                PadraoEscala.DOZE_X_TRINTA_E_SEIS
        );

        ResultadoValidacaoRegras resultado = engineConfigurado.validar(jornada, List.of());

        assertTrue(resultado.aprovado());
    }

    @Test
    void rejeitaDozePorTrintaESeisSemTrintaESeisHorasDeDescanso() {
        ParametrosRegrasTrabalhistas parametros = new ParametrosRegrasTrabalhistas(
                Duration.ofHours(8),
                Duration.ofHours(2),
                Duration.ofHours(11),
                Duration.ofHours(24),
                true
        );
        LaborRuleEngine engineConfigurado = new LaborRuleEngine(parametros);
        JornadaPlanejada anterior = new JornadaPlanejada(
                new UUID(0L, 1L),
                segunda,
                LocalTime.of(7, 0),
                LocalTime.of(19, 0),
                PadraoEscala.DOZE_X_TRINTA_E_SEIS
        );
        JornadaPlanejada proxima = new JornadaPlanejada(
                new UUID(0L, 1L),
                segunda.plusDays(1),
                LocalTime.of(19, 0),
                LocalTime.of(7, 0),
                PadraoEscala.DOZE_X_TRINTA_E_SEIS
        );

        ResultadoValidacaoRegras resultado = engineConfigurado.validar(proxima, List.of(anterior));

        assertFalse(resultado.aprovado());
    }

    @Test
    void rejeitaEscalaCincoPorDoisComSextoDiaEmJanelaDeSeteDias() {
        List<JornadaPlanejada> anteriores = List.of(
                jornada(segunda, LocalTime.of(8, 0), LocalTime.of(14, 0), PadraoEscala.CINCO_X_DOIS),
                jornada(segunda.plusDays(1), LocalTime.of(8, 0), LocalTime.of(14, 0), PadraoEscala.CINCO_X_DOIS),
                jornada(segunda.plusDays(2), LocalTime.of(8, 0), LocalTime.of(14, 0), PadraoEscala.CINCO_X_DOIS),
                jornada(segunda.plusDays(3), LocalTime.of(8, 0), LocalTime.of(14, 0), PadraoEscala.CINCO_X_DOIS),
                jornada(segunda.plusDays(4), LocalTime.of(8, 0), LocalTime.of(14, 0), PadraoEscala.CINCO_X_DOIS)
        );
        JornadaPlanejada sextoDia = jornada(segunda.plusDays(5), LocalTime.of(8, 0), LocalTime.of(10, 0), PadraoEscala.CINCO_X_DOIS);

        ResultadoValidacaoRegras resultado = engine.validar(sextoDia, anteriores);

        assertFalse(resultado.aprovado());
    }

    @Test
    void rejeitaEscalaSeisPorUmComSetimoDiaEmJanelaDeSeteDias() {
        List<JornadaPlanejada> anteriores = List.of(
                jornada(segunda, LocalTime.of(8, 0), LocalTime.of(13, 0), PadraoEscala.SEIS_X_UM),
                jornada(segunda.plusDays(1), LocalTime.of(8, 0), LocalTime.of(13, 0), PadraoEscala.SEIS_X_UM),
                jornada(segunda.plusDays(2), LocalTime.of(8, 0), LocalTime.of(13, 0), PadraoEscala.SEIS_X_UM),
                jornada(segunda.plusDays(3), LocalTime.of(8, 0), LocalTime.of(13, 0), PadraoEscala.SEIS_X_UM),
                jornada(segunda.plusDays(4), LocalTime.of(8, 0), LocalTime.of(13, 0), PadraoEscala.SEIS_X_UM),
                jornada(segunda.plusDays(5), LocalTime.of(8, 0), LocalTime.of(13, 0), PadraoEscala.SEIS_X_UM)
        );
        JornadaPlanejada setimoDia = jornada(segunda.plusDays(6), LocalTime.of(8, 0), LocalTime.of(10, 0), PadraoEscala.SEIS_X_UM);

        ResultadoValidacaoRegras resultado = engine.validar(setimoDia, anteriores);

        assertFalse(resultado.aprovado());
    }

    @Test
    void exigeControleDePontoSomenteAcimaDeVinteFuncionariosPorPadrao() {
        ParametrosRegrasTrabalhistas parametros = ParametrosRegrasTrabalhistas.padraoBrasil();

        assertFalse(parametros.exigeControlePonto(20));
        assertTrue(parametros.exigeControlePonto(21));
    }

    private JornadaPlanejada jornada(LocalDate data, LocalTime inicio, LocalTime fim) {
        return new JornadaPlanejada(new UUID(0L, 1L), data, inicio, fim, PadraoEscala.COMUM);
    }

    private JornadaPlanejada jornada(LocalDate data, LocalTime inicio, LocalTime fim, PadraoEscala padrao) {
        return new JornadaPlanejada(new UUID(0L, 1L), data, inicio, fim, padrao);
    }
}
