package com.escala.authservice.scheduling.domain.policy;

import com.escala.authservice.scheduling.domain.enums.PadraoEscala;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

public class LaborRuleEngine {
    private final List<RegraTrabalhista> regras;
    private final ParametrosRegrasTrabalhistas parametros;

    public LaborRuleEngine() {
        this(ParametrosRegrasTrabalhistas.padraoBrasil());
    }

    public LaborRuleEngine(ParametrosRegrasTrabalhistas parametros) {
        this(List.of(
                new HorarioObrigatorioRule(),
                new ConflitoEscalaRule(),
                new JornadaDiariaRule(),
                new JornadaSemanalRule(),
                new JornadaMensalRule(),
                new IntervaloIntrajornadaRule(),
                new EscalaDozeTrintaSeisRule(),
                new PadraoEscalaRule(),
                new IntervaloInterjornadaRule(),
                new DescansoSemanalRule()
        ), parametros);
    }

    public LaborRuleEngine(List<RegraTrabalhista> regras, ParametrosRegrasTrabalhistas parametros) {
        this.regras = List.copyOf(regras);
        this.parametros = parametros;
    }

    public ResultadoValidacaoRegras validar(JornadaPlanejada jornada, List<JornadaPlanejada> jornadasRelacionadas) {
        if (jornada.data() == null || jornada.inicio() == null || jornada.fim() == null) {
            return new ResultadoValidacaoRegras(List.of("Data, horario inicial e horario final sao obrigatorios"));
        }
        List<JornadaPlanejada> relacionadas = jornadasRelacionadas == null ? List.of() : jornadasRelacionadas;

        List<String> violacoes = regras.stream()
                .map(regra -> regra.validar(jornada, relacionadas, parametros))
                .flatMap(Optional::stream)
                .toList();
        return new ResultadoValidacaoRegras(violacoes);
    }

    private static class HorarioObrigatorioRule implements RegraTrabalhista {
        @Override
        public Optional<String> validar(
                JornadaPlanejada jornada,
                List<JornadaPlanejada> jornadasRelacionadas,
                ParametrosRegrasTrabalhistas parametros
        ) {
            if (jornada.data() == null || jornada.inicio() == null || jornada.fim() == null) {
                return Optional.of("Data, horario inicial e horario final sao obrigatorios");
            }
            return Optional.empty();
        }
    }

    private static class ConflitoEscalaRule implements RegraTrabalhista {
        @Override
        public Optional<String> validar(
                JornadaPlanejada jornada,
                List<JornadaPlanejada> jornadasRelacionadas,
                ParametrosRegrasTrabalhistas parametros
        ) {
            return jornadasRelacionadas.stream()
                    .filter(outra -> mesmaPessoa(jornada, outra))
                    .filter(outra -> sobrepoe(jornada, outra))
                    .findFirst()
                    .map(outra -> "Funcionario possui escala conflitante no mesmo periodo");
        }

        private boolean sobrepoe(JornadaPlanejada jornada, JornadaPlanejada outra) {
            return jornada.inicioEmData().isBefore(outra.fimEmData())
                    && outra.inicioEmData().isBefore(jornada.fimEmData());
        }
    }

    private static class JornadaDiariaRule implements RegraTrabalhista {
        @Override
        public Optional<String> validar(
                JornadaPlanejada jornada,
                List<JornadaPlanejada> jornadasRelacionadas,
                ParametrosRegrasTrabalhistas parametros
        ) {
            Duration duracao = jornada.duracao();
            if (duracao.isZero() || duracao.isNegative()) {
                return Optional.of("A jornada deve ter duracao positiva");
            }
            if (jornada.padrao() == PadraoEscala.DOZE_X_TRINTA_E_SEIS) {
                return Optional.empty();
            }
            if (duracao.compareTo(parametros.jornadaDiariaMaximaComHoraExtra()) > 0) {
                return Optional.of("Jornada excede o limite diario configurado");
            }
            return Optional.empty();
        }
    }

    private static class JornadaSemanalRule implements RegraTrabalhista {
        @Override
        public Optional<String> validar(
                JornadaPlanejada jornada,
                List<JornadaPlanejada> jornadasRelacionadas,
                ParametrosRegrasTrabalhistas parametros
        ) {
            LocalDate inicioSemana = jornada.data().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate fimSemana = jornada.data().with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
            Duration totalSemana = jornadasDoPeriodo(jornada, jornadasRelacionadas, inicioSemana, fimSemana).stream()
                    .map(JornadaPlanejada::duracao)
                    .reduce(Duration.ZERO, Duration::plus);

            if (totalSemana.compareTo(parametros.jornadaSemanalMaxima()) > 0) {
                return Optional.of("Jornada semanal excede o limite configurado");
            }
            return Optional.empty();
        }
    }

    private static class JornadaMensalRule implements RegraTrabalhista {
        @Override
        public Optional<String> validar(
                JornadaPlanejada jornada,
                List<JornadaPlanejada> jornadasRelacionadas,
                ParametrosRegrasTrabalhistas parametros
        ) {
            LocalDate inicioMes = jornada.data().withDayOfMonth(1);
            LocalDate fimMes = jornada.data().withDayOfMonth(jornada.data().lengthOfMonth());
            Duration totalMes = jornadasDoPeriodo(jornada, jornadasRelacionadas, inicioMes, fimMes).stream()
                    .map(JornadaPlanejada::duracao)
                    .reduce(Duration.ZERO, Duration::plus);

            if (totalMes.compareTo(parametros.jornadaMensalReferencia()) > 0) {
                return Optional.of("Jornada mensal excede a referencia configurada");
            }
            return Optional.empty();
        }
    }

    private static class IntervaloIntrajornadaRule implements RegraTrabalhista {
        @Override
        public Optional<String> validar(
                JornadaPlanejada jornada,
                List<JornadaPlanejada> jornadasRelacionadas,
                ParametrosRegrasTrabalhistas parametros
        ) {
            if (jornada.intervaloIntrajornada() == null) {
                return Optional.empty();
            }

            Duration duracao = jornada.duracao();
            Duration intervalo = jornada.intervaloIntrajornada();

            if (duracao.compareTo(Duration.ofHours(6)) > 0) {
                if (intervalo.compareTo(parametros.intervaloIntrajornadaMinimoAcimaSeisHoras()) < 0) {
                    return Optional.of("Intervalo intrajornada minimo de 1 hora nao respeitado");
                }
                if (intervalo.compareTo(parametros.intervaloIntrajornadaMaximoAcimaSeisHoras()) > 0) {
                    return Optional.of("Intervalo intrajornada maximo de 2 horas excedido");
                }
                return Optional.empty();
            }

            if (duracao.compareTo(Duration.ofHours(4)) > 0
                    && intervalo.compareTo(parametros.intervaloIntrajornadaMinimoEntreQuatroESeisHoras()) < 0) {
                return Optional.of("Intervalo intrajornada minimo de 15 minutos nao respeitado");
            }
            return Optional.empty();
        }
    }

    private static class EscalaDozeTrintaSeisRule implements RegraTrabalhista {
        @Override
        public Optional<String> validar(
                JornadaPlanejada jornada,
                List<JornadaPlanejada> jornadasRelacionadas,
                ParametrosRegrasTrabalhistas parametros
        ) {
            if (jornada.padrao() != PadraoEscala.DOZE_X_TRINTA_E_SEIS) {
                return Optional.empty();
            }
            if (!parametros.permiteEscalaDozePorTrintaESeis()) {
                return Optional.of("Escala 12x36 exige acordo ou configuracao formal");
            }
            if (!jornada.duracao().equals(Duration.ofHours(12))) {
                return Optional.of("Escala 12x36 deve ter 12 horas de trabalho");
            }
            boolean descansoInsuficiente = jornadasRelacionadas.stream()
                    .filter(outra -> mesmaPessoa(jornada, outra))
                    .anyMatch(outra -> descansoDozePorTrintaESeisInsuficiente(jornada, outra));
            if (descansoInsuficiente) {
                return Optional.of("Escala 12x36 exige 36 horas de descanso entre jornadas");
            }
            return Optional.empty();
        }

        private boolean descansoDozePorTrintaESeisInsuficiente(JornadaPlanejada jornada, JornadaPlanejada outra) {
            if (outra.fimEmData().isBefore(jornada.inicioEmData()) || outra.fimEmData().isEqual(jornada.inicioEmData())) {
                return Duration.between(outra.fimEmData(), jornada.inicioEmData()).compareTo(Duration.ofHours(36)) < 0;
            }
            if (jornada.fimEmData().isBefore(outra.inicioEmData()) || jornada.fimEmData().isEqual(outra.inicioEmData())) {
                return Duration.between(jornada.fimEmData(), outra.inicioEmData()).compareTo(Duration.ofHours(36)) < 0;
            }
            return true;
        }
    }

    private static class PadraoEscalaRule implements RegraTrabalhista {
        @Override
        public Optional<String> validar(
                JornadaPlanejada jornada,
                List<JornadaPlanejada> jornadasRelacionadas,
                ParametrosRegrasTrabalhistas parametros
        ) {
            if (jornada.padrao() != PadraoEscala.CINCO_X_DOIS && jornada.padrao() != PadraoEscala.SEIS_X_UM) {
                return Optional.empty();
            }

            LocalDate inicioJanela = jornada.data().minusDays(6);
            long diasTrabalhados = jornadasDoPeriodo(jornada, jornadasRelacionadas, inicioJanela, jornada.data()).stream()
                    .map(JornadaPlanejada::data)
                    .distinct()
                    .count();

            if (jornada.padrao() == PadraoEscala.CINCO_X_DOIS && diasTrabalhados > 5) {
                return Optional.of("Escala 5x2 exige dois dias de descanso a cada sete dias");
            }
            if (jornada.padrao() == PadraoEscala.SEIS_X_UM && diasTrabalhados > 6) {
                return Optional.of("Escala 6x1 exige um dia de descanso a cada sete dias");
            }
            return Optional.empty();
        }
    }

    private static class IntervaloInterjornadaRule implements RegraTrabalhista {
        @Override
        public Optional<String> validar(
                JornadaPlanejada jornada,
                List<JornadaPlanejada> jornadasRelacionadas,
                ParametrosRegrasTrabalhistas parametros
        ) {
            return jornadasRelacionadas.stream()
                    .filter(outra -> mesmaPessoa(jornada, outra))
                    .filter(outra -> !outra.data().equals(jornada.data()))
                    .filter(outra -> intervaloEntre(jornada, outra).compareTo(parametros.intervaloInterjornadaMinimo()) < 0)
                    .findFirst()
                    .map(outra -> "Intervalo interjornada minimo de 11 horas nao respeitado");
        }

        private Duration intervaloEntre(JornadaPlanejada atual, JornadaPlanejada outra) {
            if (outra.fimEmData().isBefore(atual.inicioEmData()) || outra.fimEmData().isEqual(atual.inicioEmData())) {
                return Duration.between(outra.fimEmData(), atual.inicioEmData());
            }
            return Duration.between(atual.fimEmData(), outra.inicioEmData());
        }
    }

    private static class DescansoSemanalRule implements RegraTrabalhista {
        @Override
        public Optional<String> validar(
                JornadaPlanejada jornada,
                List<JornadaPlanejada> jornadasRelacionadas,
                ParametrosRegrasTrabalhistas parametros
        ) {
            List<JornadaPlanejada> jornadas = Stream.concat(Stream.of(jornada), jornadasRelacionadas.stream())
                    .filter(outra -> mesmaPessoa(jornada, outra))
                    .filter(outra -> !outra.data().isBefore(jornada.data().minusDays(6)))
                    .filter(outra -> !outra.data().isAfter(jornada.data().plusDays(6)))
                    .sorted(Comparator.comparing(JornadaPlanejada::inicioEmData))
                    .toList();

            for (int indice = 0; indice + 6 < jornadas.size(); indice++) {
                LocalDate primeira = jornadas.get(indice).data();
                LocalDate setima = jornadas.get(indice + 6).data();
                if (setima.minusDays(6).equals(primeira) && maiorDescanso(jornadas.subList(indice, indice + 7)).compareTo(parametros.descansoSemanalMinimo()) < 0) {
                    return Optional.of("Descanso semanal remunerado minimo de 24 horas nao respeitado");
                }
            }
            return Optional.empty();
        }

        private Duration maiorDescanso(List<JornadaPlanejada> jornadas) {
            Duration maior = Duration.ZERO;
            for (int indice = 0; indice + 1 < jornadas.size(); indice++) {
                LocalDateTime fimAtual = jornadas.get(indice).fimEmData();
                LocalDateTime inicioProxima = jornadas.get(indice + 1).inicioEmData();
                Duration descanso = Duration.between(fimAtual, inicioProxima);
                if (descanso.compareTo(maior) > 0) {
                    maior = descanso;
                }
            }
            return maior;
        }
    }

    private static boolean mesmaPessoa(JornadaPlanejada jornada, JornadaPlanejada outra) {
        return jornada.funcionarioId() != null && jornada.funcionarioId().equals(outra.funcionarioId());
    }

    private static List<JornadaPlanejada> jornadasDoPeriodo(
            JornadaPlanejada jornada,
            List<JornadaPlanejada> jornadasRelacionadas,
            LocalDate inicio,
            LocalDate fim
    ) {
        return Stream.concat(Stream.of(jornada), jornadasRelacionadas.stream())
                .filter(outra -> mesmaPessoa(jornada, outra))
                .filter(outra -> !outra.data().isBefore(inicio))
                .filter(outra -> !outra.data().isAfter(fim))
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }
}
