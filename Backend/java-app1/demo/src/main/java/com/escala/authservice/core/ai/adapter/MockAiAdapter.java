package com.escala.authservice.core.ai.adapter;

import com.escala.authservice.core.ai.port.AiProviderPort;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class MockAiAdapter implements AiProviderPort {

    @Override
    public String generateResponse(Map<String, Object> context, String instruction) {
        // Simulação de motor de IA para desenvolvimento local/testes sem custo de API
        if (instruction.contains("substituto")) {
            return "Com base na proximidade e histórico de escalas, sugiro o colaborador João Silva para cobrir este turno.";
        }
        if (instruction.contains("risco")) {
            return "Análise de Risco: Baixo risco. Todos os setores possuem cobertura mínima garantida para os próximos 7 dias.";
        }
        if (instruction.contains("conflito")) {
            return "Explicação de Conflito: O colaborador está escalado em um turno de 12 horas e o descanso de 36 horas não seria respeitado se esta nova escala fosse confirmada.";
        }
        return "IA: Processamento concluído com sucesso. Nenhuma anomalia detectada nos dados fornecidos.";
    }
}
